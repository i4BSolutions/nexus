import { createClient } from "@/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { ApiResponse } from "@/types/api-response-type";
import { PurchaseOrderInterface } from "@/types/purchase-order/purchase-order.type";

/**
 * This API route creates a purchase order.
 * @param req - NextRequest object
 * @returns NextResponse ApiResponse<PurchaseOrderInterface | null>
 */
export async function POST(
  req: NextRequest
): Promise<
  NextResponse<ApiResponse<PurchaseOrderInterface> | ApiResponse<null>>
> {
  const supabase = await createClient();
  const body = await req.json();

  const {
    po_number,
    supplier,
    region,
    budget,
    order_date,
    currency,
    exchange_rate,
    contact_person,
    sign_person,
    authorized_sign_person,
    expected_delivery_date,
    note,
    status,
    items = [],
  } = body;

  const orderData = {
    purchase_order_no: po_number,
    supplier_id: supplier,
    region_id: region,
    budget_id: Number(budget),
    order_date,
    currency_id: currency,
    usd_exchange_rate: Number(exchange_rate),
    contact_person_id: contact_person,
    sign_person_id: sign_person,
    authorized_signer_id: authorized_sign_person,
    expected_delivery_date,
    note: note ?? null,
    status: status ?? "Draft",
  };

  const { data: order, error: orderError } = await supabase
    .from("purchase_order")
    .insert(orderData)
    .select()
    .single();

  if (orderError) {
    return NextResponse.json(error(orderError.message), { status: 500 });
  }

  const itemsToInsert = (items || []).map((item: any) => ({
    purchase_order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price_local: item.unit_price_local,
  }));

  if (itemsToInsert.length > 0) {
    const { error: itemsError } = await supabase
      .from("purchase_order_items")
      .insert(itemsToInsert);

    if (itemsError) {
      return NextResponse.json(error(itemsError.message), { status: 500 });
    }
  }

  return NextResponse.json(
    success(order, "Purchase order and items created successfully"),
    { status: 200 }
  );
}
