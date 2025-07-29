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

  // Validate All Items First
  for (const item of stock_out_items) {
    const {
      product_id,
      warehouse_id,
      quantity,
      reason,
      destination_warehouse_id,
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
  }

  // If any validation failed — abort all
  if (validationErrors.length > 0) {
    return NextResponse.json(
      error("Stock-out failed due to some invalid items", 400, {
        errors: validationErrors,
      }),
      { status: 400 }
    );
  }

  // Proceed with Stock-Out for All Items
  const results: any[] = [];

  for (const item of stock_out_items) {
    const {
      product_id,
      warehouse_id,
      quantity,
      reason,
      destination_warehouse_id,
      note,
    } = item;

    const { data: stockRow } = await supabase
      .from("inventory")
      .select("id, quantity")
      .eq("product_id", product_id)
      .eq("warehouse_id", warehouse_id)
      .single();

    // Update inventory
    const { error: updateError } = await supabase
      .from("inventory")
      .update({ quantity: stockRow?.quantity - quantity })
      .eq("id", stockRow?.id);

    if (updateError) {
      return NextResponse.json(error("Failed to update inventory", 500), {
        status: 500,
      });
    }

    // Log stock-out transaction
    const { error: txError } = await supabase.from("stock_transaction").insert([
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
      },
    ]);

    if (txError) {
      return NextResponse.json(error("Failed to log stock-out", 500), {
        status: 500,
      });
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
