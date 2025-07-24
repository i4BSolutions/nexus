import { getAuthenticatedUser } from "@/helper/getUser";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { error, success } from "@/lib/api-response";
import { ApiResponse } from "@/types/shared/api-response-type";

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<any> | ApiResponse<null>>> {
  const supabase = await createClient();

  const user = await getAuthenticatedUser(supabase);

  const body = await req.json();

  const {
    product_id,
    warehouse_id,
    quantity,
    invoice_line_item_id,
    invoice_id,
  } = body;

  if (
    !product_id ||
    !warehouse_id ||
    !quantity ||
    !invoice_line_item_id ||
    !invoice_id
  ) {
    return NextResponse.json(error("Missing required fields", 400), {
      status: 400,
    });
  }

  // 1. Fetch expected quantity from purchase_invoice_item
  const { data: lineItem, error: itemError } = await supabase
    .from("purchase_invoice_item")
    .select("quantity")
    .eq("id", invoice_line_item_id)
    .single();

  if (itemError || !lineItem) {
    return NextResponse.json(error("Invoice line item not found", 404), {
      status: 404,
    });
  }

  const expectedQty = lineItem.quantity;

  // 2. Fetch total stock-in quantity from stock_transaction for this product and invoice
  const { data: stockInAgg, error: stockError } = await supabase
    .from("stock_transaction")
    .select("quantity")
    .eq("invoice_id", invoice_id)
    .eq("product_id", product_id);

  const alreadyStockedIn =
    stockInAgg?.reduce((acc, tx) => acc + tx.quantity, 0) || 0;

  const remainingQty = expectedQty - alreadyStockedIn;

  if (quantity > remainingQty) {
    return NextResponse.json(
      error(`Stock-in exceeds remaining quantity (${remainingQty})`, 400),
      { status: 400 }
    );
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

  // 4. Log the stock-in transaction
  const { data, error: logError } = await supabase
    .from("stock_transaction")
    .insert([
      {
        type: "IN",
        product_id,
        warehouse_id,
        quantity,
        invoice_id,
        user_id: user.id,
        note: `Stocked in from invoice line item`,
      },
    ])
    .select()
    .single();

  if (logError) {
    return NextResponse.json(error(logError?.message || "Unknown error", 500), {
      status: 500,
    });
  }

  return NextResponse.json(success(data, "Stock-in successful"), {
    status: 201,
  });
}
