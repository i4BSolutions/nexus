import { getAuthenticatedUser } from "@/helper/getUser";
import { createClient } from "@/lib/supabase/server";

import { NextRequest, NextResponse } from "next/server";

import { ApiResponse } from "@/types/shared/api-response-type";
import { GetPurchaseOrderDetailDto } from "@/types/purchase-order/purchase-order.type";

import { error, success } from "@/lib/api-response";

/**
 * This API route retrieves a purchase order by ID with joined data from related tables.
 * @param req - NextRequest object
 * @param context - Context object
 * @returns NextResponse ApiResponse<GetPurchaseOrderDetailDto | null>
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<GetPurchaseOrderDetailDto | null>>> {
  const supabase = await createClient();
  const { id: idStr } = await context.params;

  // Get purchase order with joined data
  // TODO: Add budget data - budget:budget_id(budget_name, project_name, description, status),
  const { data: purchaseOrder, error: poError } = await supabase
    .from("purchase_order")
    .select(
      `
      *,
      supplier:supplier_id(name, contact_person, email, phone, address, status),
      region:region_id(name),
      currency:currency_id(currency_code, currency_name),
      contact_person:contact_person_id(name),
      sign_person:sign_person_id(name),
      authorized_signer:authorized_signer_id(name)
    `
    )
    .eq("id", idStr)
    .single();

  if (poError) {
    return NextResponse.json(error(poError.message), { status: 500 });
  }

  if (!purchaseOrder) {
    return NextResponse.json(error("Purchase order not found"), {
      status: 404,
    });
  }

  // Get purchase order items with product information
  const { data: items, error: itemsError } = await supabase
    .from("purchase_order_items")
    .select(
      `
      *,
      product:product_id(name, sku, description)
    `
    )
    .eq("purchase_order_id", idStr);

  if (itemsError) {
    return NextResponse.json(error(itemsError.message), { status: 500 });
  }

  // Calculate totals
  const totalAmountLocal =
    items?.reduce(
      (sum, item) => sum + item.quantity * item.unit_price_local,
      0
    ) || 0;

  const totalAmountUSD = totalAmountLocal / purchaseOrder.usd_exchange_rate;

  // Format items for the DTO
  const formattedItems =
    items?.map((item) => ({
      id: item.id,
      product_name: item.product?.name || `Product ID: ${item.product_id}`,
      quantity: item.quantity,
      unit_price_local: item.unit_price_local,
      unit_price_usd: item.unit_price_local / purchaseOrder.usd_exchange_rate,
      sub_total_local: item.quantity * item.unit_price_local,
      sub_total_usd:
        (item.quantity * item.unit_price_local) /
        purchaseOrder.usd_exchange_rate,
    })) || [];

  // Format the response according to GetPurchaseOrderDetailDto
  const result: GetPurchaseOrderDetailDto = {
    id: purchaseOrder.id,
    purchase_order_no: purchaseOrder.purchase_order_no,
    supplier: purchaseOrder.supplier?.name || "Unknown Supplier",
    region: purchaseOrder.region?.name || "Unknown Region",
    order_date: purchaseOrder.order_date,
    expected_delivery_date: purchaseOrder.expected_delivery_date,
    budget: purchaseOrder.budget_id,
    currency_code: purchaseOrder.currency?.currency_code || "USD",
    usd_exchange_rate: purchaseOrder.usd_exchange_rate,
    product_items: formattedItems,
    total_amount_local: totalAmountLocal,
    total_amount_usd: totalAmountUSD,
    contact_person: purchaseOrder.contact_person?.name || "Not specified",
    sign_person: purchaseOrder.sign_person?.name,
    authorized_sign_person: purchaseOrder.authorized_signer?.name,
    note: purchaseOrder.note,
  };

  return NextResponse.json(success(result), { status: 200 });
}
