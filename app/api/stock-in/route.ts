import { getAuthenticatedUser } from "@/helper/getUser";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { error, success } from "@/lib/api-response";
import { ApiResponse } from "@/types/shared/api-response-type";

type LineItemInput = {
  product_id: number;
  warehouse_id: number;
  quantity: number;
  invoice_line_item_id: number;
  invoice_id: number;
};

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<any> | ApiResponse<null>>> {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  const body = await req.json();

  const invoiceItems: LineItemInput[] = body.invoice_items;

  if (!Array.isArray(invoiceItems) || invoiceItems.length === 0) {
    return NextResponse.json(error("No invoice items provided", 400), {
      status: 400,
    });
  }

  const results: any[] = [];

  for (const item of invoiceItems) {
    const {
      product_id,
      warehouse_id,
      quantity,
      invoice_line_item_id,
      invoice_id,
    } = item;

    if (
      !product_id ||
      !warehouse_id ||
      !quantity ||
      !invoice_line_item_id ||
      !invoice_id
    ) {
      results.push({
        item,
        success: false,
        error: "Missing required fields",
      });
      continue;
    }

    // 1. Fetch expected quantity from purchase_invoice_item
    const { data: lineItem, error: itemError } = await supabase
      .from("purchase_invoice_item")
      .select("quantity")
      .eq("id", invoice_line_item_id)
      .single();

    if (itemError || !lineItem) {
      results.push({
        item,
        success: false,
        error: "Invoice line item not found",
      });
      continue;
    }

    const expectedQty = lineItem.quantity;

    // 2. Fetch total stock-in quantity from stock_transaction for this product and invoice
    const { data: stockInAgg } = await supabase
      .from("stock_transaction")
      .select("quantity")
      .eq("invoice_id", invoice_id)
      .eq("product_id", product_id);

    const alreadyStockedIn =
      stockInAgg?.reduce((acc, tx) => acc + tx.quantity, 0) || 0;
    const remainingQty = expectedQty - alreadyStockedIn;

    if (quantity > remainingQty) {
      results.push({
        item,
        success: false,
        error: `Stock-in exceeds remaining quantity (${remainingQty})`,
      });
      continue;
    }

    // 3. UPSERT inventory
    const { data: existing } = await supabase
      .from("inventory")
      .select("id, quantity")
      .eq("product_id", product_id)
      .eq("warehouse_id", warehouse_id)
      .single();

    if (existing) {
      await supabase
        .from("inventory")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("inventory")
        .insert([{ product_id, warehouse_id, quantity }]);
    }

    // 4. Log transaction
    const { error: logError } = await supabase
      .from("stock_transaction")
      .insert([
        {
          type: "IN",
          product_id,
          warehouse_id,
          quantity,
          invoice_id,
          note: `Stocked in from invoice line item`,
          user_id: user.id,
        },
      ]);

    if (logError) {
      results.push({
        item,
        success: false,
        error: logError?.message || "Failed to log stock-in",
      });
      continue;
    }

    results.push({
      item,
      success: true,
      message: "Stock-in successful",
    });
  }

  return NextResponse.json(success(results, "Processed stock-in items"), {
    status: 200,
  });
}
