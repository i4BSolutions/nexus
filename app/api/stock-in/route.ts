import { getAuthenticatedUser } from "@/helper/getUser";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { error, success } from "@/lib/api-response";
import { ApiResponse } from "@/types/shared/api-response-type";

type InvoiceItem = {
  product_id: number;
  warehouse_id: number;
  quantity: number;
  invoice_line_item_id: number;
};

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<any>>> {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  const body = await req.json();

  const invoice_items: InvoiceItem[] = body.invoice_items;

  if (!Array.isArray(invoice_items) || invoice_items.length === 0) {
    return NextResponse.json(error("No invoice items provided", 400), {
      status: 400,
    });
  }

  const errors: any[] = [];

  // First pass: validation only
  for (const item of invoice_items) {
    const { product_id, warehouse_id, quantity, invoice_line_item_id } = item;

    if (!product_id || !warehouse_id || !quantity || !invoice_line_item_id) {
      errors.push({
        item,
        error: "Missing required fields",
      });
      continue;
    }

    // Check invoice line item
    const { data: lineItem, error: itemError } = await supabase
      .from("purchase_invoice_item")
      .select("quantity")
      .eq("id", invoice_line_item_id)
      .single();

    if (itemError || !lineItem) {
      errors.push({
        item,
        error: "Invoice line item not found",
      });
      continue;
    }

    const expectedQty = lineItem.quantity;

    // Check how much has already been stocked in
    const { data: stockInAgg } = await supabase
      .from("stock_transaction")
      .select("quantity")
      .eq("invoice_line_item_id", invoice_line_item_id)
      .eq("product_id", product_id);

    const alreadyStockedIn =
      stockInAgg?.reduce((acc, tx) => acc + tx.quantity, 0) || 0;
    const remainingQty = expectedQty - alreadyStockedIn;

    if (quantity > remainingQty) {
      errors.push({
        item,
        error: `Stock-in exceeds remaining quantity (${remainingQty})`,
      });
    }
  }

  // If any errors, abort
  if (errors.length > 0) {
    return NextResponse.json(
      error("Some items cannot be stocked in", 400, { errors }),
      { status: 400 }
    );
  }

  // Second pass: perform inventory updates and transaction logs
  const results: any[] = [];

  for (const item of invoice_items) {
    const { product_id, warehouse_id, quantity, invoice_line_item_id } = item;

    // Check if inventory record exists
    const { data: existing } = await supabase
      .from("inventory")
      .select("id, quantity")
      .eq("product_id", product_id)
      .eq("warehouse_id", warehouse_id)
      .single();

    if (existing) {
      const { error: updateError } = await supabase
        .from("inventory")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);

      if (updateError) {
        return NextResponse.json(error("Failed to update inventory", 500), {
          status: 500,
        });
      }
    } else {
      const { error: insertError } = await supabase
        .from("inventory")
        .insert([{ product_id, warehouse_id, quantity }]);

      if (insertError) {
        return NextResponse.json(error("Failed to insert inventory", 500), {
          status: 500,
        });
      }
    }

    // Log stock transaction
    const { error: logError } = await supabase
      .from("stock_transaction")
      .insert([
        {
          type: "IN",
          product_id,
          warehouse_id,
          quantity,
          invoice_line_item_id,
          user_id: user.id,
          note: "Stocked in from invoice line item",
        },
      ]);

    if (logError) {
      return NextResponse.json(error("Failed to log stock-in", 500), {
        status: 500,
      });
    }

    results.push({
      item,
      success: true,
      message: "Stock-in successful",
    });
  }

  return NextResponse.json(success(results, "Stock-in complete"), {
    status: 201,
  });
}
