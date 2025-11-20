import { getAuthenticatedUser } from "@/helper/getUser";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { error, success } from "@/lib/api-response";
import { ApiResponse } from "@/types/shared/api-response-type";

type StockOutItem = {
  product_id: number;
  warehouse_id: number;
  quantity: number;
  reason: string;
  destination_warehouse_id?: number;
  note?: string;
  assets?: Array<{
    id: string; // files.id (from uploads)
    key: string;
    mime: string;
    size_bytes: number;
    original_filename: string;
    type: "photo" | "pdf";
  }>;
  approve_by_contact_id?: number;
  approval_order_no?: string;
  approval_letter_id?: string;
};

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<any>>> {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  const body = await req.json();

  const stock_out_items: StockOutItem[] = body.stock_out_items;

  if (!Array.isArray(stock_out_items) || stock_out_items.length === 0) {
    return NextResponse.json(error("No stock-out items provided", 400), {
      status: 400,
    });
  }

  const validationErrors: any[] = [];

  for (const item of stock_out_items) {
    const {
      product_id,
      warehouse_id,
      quantity,
      reason,
      destination_warehouse_id,
      assets,
      approve_by_contact_id,
      approval_order_no,
    } = item;

    if (!product_id || !warehouse_id || !quantity || !reason) {
      validationErrors.push({
        item,
        error: "Missing required fields",
      });
      continue;
    }

    if (quantity < 1) {
      validationErrors.push({
        item,
        error: "Minimum quantity is 1",
      });
      continue;
    }

    if (!approve_by_contact_id || !approval_order_no) {
      validationErrors.push({
        item,
        error: "Approval contact and order no are required",
      });
    }

    const photos = (assets ?? []).filter((a) => a.type === "photo");
    const approvals = (assets ?? []).filter(
      (a) => a.type === "pdf" || a.mime?.startsWith("image/")
    );

    if (photos.length < 1) {
      validationErrors.push({ item, error: "At least one photo is required" });
    }
    if (approvals.length < 1) {
      validationErrors.push({
        item,
        error: "At least one approval letter (PDF/JPG/PNG) is required",
      });
    }

    const { data: stockRow } = await supabase
      .from("inventory")
      .select("id, quantity")
      .eq("product_id", product_id)
      .eq("warehouse_id", warehouse_id)
      .single();

    if (!stockRow || stockRow.quantity < quantity) {
      validationErrors.push({
        item,
        error: `Insufficient stock (${stockRow?.quantity})`,
      });
    }

    // For transfers, destination_warehouse_id must be present
    if (reason === "Warehouse Transfer" && !destination_warehouse_id) {
      validationErrors.push({
        item,
        error: "Missing destination warehouse ID for transfer",
      });
    }
  }

  if (validationErrors.length > 0) {
    return NextResponse.json(
      error("Stock-out failed due to some invalid items", 400, {
        errors: validationErrors,
      }),
      { status: 400 }
    );
  }

  const results: any[] = [];

  for (const item of stock_out_items) {
    const {
      product_id,
      warehouse_id,
      quantity,
      reason,
      destination_warehouse_id,
      note,
      assets = [],
      approve_by_contact_id,
      approval_order_no,
    } = item;

    const photos = assets.filter((a) => a.type === "photo");
    const approvals = assets.filter(
      (a) => a.type === "pdf" || a.mime?.startsWith("image/")
    );

    const { data: stockRow } = await supabase
      .from("inventory")
      .select("id, quantity")
      .eq("product_id", product_id)
      .eq("warehouse_id", warehouse_id)
      .single();

    // 1. Update source warehouse inventory
    const { error: updateError } = await supabase
      .from("inventory")
      .update({ quantity: stockRow?.quantity - quantity })
      .eq("id", stockRow?.id);

    if (updateError) {
      return NextResponse.json(
        error("Failed to update source inventory", 500),
        {
          status: 500,
        }
      );
    }

    // 2. Insert stock-out transaction
    const { data: tx, error: txError } = await supabase
      .from("stock_transaction")
      .insert([
        {
          product_id,
          warehouse_id,
          quantity,
          type: "OUT",
          reason,
          user_id: user.id,
          destination_warehouse_id:
            reason === "Warehouse Transfer" ? destination_warehouse_id : null,
          note,
          approve_by_contact_id,
          approval_order_no,
          evidence_photo_count: photos?.length,
          approval_letter_id: approvals?.[0]?.id ?? null, // FK to files table
        },
      ])
      .select()
      .single();

    if (txError) {
      return NextResponse.json(
        error(txError.message || "Failed to log stock-out", 500),
        {
          status: 500,
        }
      );
    }

    if (assets.length > 0) {
      const rows = assets.map((a) => ({
        transaction_id: tx.id,
        type: a.type,
        storage_key: a.key,
        original_filename: a.original_filename,
        mime: a.mime,
        size_bytes: a.size_bytes ?? 0,
      }));

      const { error: assetErr } = await supabase
        .from("stock_transaction_assets")
        .insert(rows);

      if (assetErr) {
        return NextResponse.json(
          error(assetErr.message || "Failed to log stock-out assets", 500),
          {
            status: 500,
          }
        );
      }
    }

    // 3. For transfers, add stock to destination warehouse
    if (reason === "Warehouse Transfer" && destination_warehouse_id) {
      const { data: destInventory } = await supabase
        .from("inventory")
        .select("id, quantity")
        .eq("product_id", product_id)
        .eq("warehouse_id", destination_warehouse_id)
        .single();

      if (destInventory) {
        // Update existing inventory
        const { error: destUpdateError } = await supabase
          .from("inventory")
          .update({ quantity: destInventory.quantity + quantity })
          .eq("id", destInventory.id);

        if (destUpdateError) {
          return NextResponse.json(
            error("Failed to update destination inventory", 500),
            {
              status: 500,
            }
          );
        }
      } else {
        // Insert new inventory row
        const { error: destInsertError } = await supabase
          .from("inventory")
          .insert([
            {
              product_id,
              warehouse_id: destination_warehouse_id,
              quantity,
            },
          ]);

        if (destInsertError) {
          return NextResponse.json(
            error("Failed to create destination inventory", 500),
            {
              status: 500,
            }
          );
        }
      }

      // 4. Log stock-in transaction in destination warehouse
      const { error: destTxError } = await supabase
        .from("stock_transaction")
        .insert([
          {
            product_id,
            warehouse_id: destination_warehouse_id,
            quantity,
            type: "IN",
            reason: "Warehouse Transfer (Received)",
            user_id: user.id,
            note: `Transfer from warehouse ${warehouse_id}`,
          },
        ]);

      if (destTxError) {
        return NextResponse.json(
          error("Failed to log stock-in at destination", 500),
          {
            status: 500,
          }
        );
      }
    }

    results.push({
      item,
      success: true,
      message: "Stock-out successful",
    });
  }

  return NextResponse.json(success(results, "Stock-out completed"), {
    status: 201,
  });
}
