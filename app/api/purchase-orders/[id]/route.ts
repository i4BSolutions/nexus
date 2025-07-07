import { getAuthenticatedUser } from "@/helper/getUser";
import { createClient } from "@/lib/supabase/server";

import { NextRequest, NextResponse } from "next/server";

import { ApiResponse } from "@/types/shared/api-response-type";
import { PurchaseOrderDetailInterface } from "@/types/purchase-order/purchase-order.type";

import { error, success } from "@/lib/api-response";

/**
 * This API route retrieves a purchase order by ID with joined data from related tables.
 * @param req - NextRequest object
 * @param context - Context object
 * @returns NextResponse ApiResponse<PurchaseOrderDetailInterface | null>
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<PurchaseOrderDetailInterface | null>>> {
  const supabase = await createClient();
  const { id: idStr } = await context.params;

  // Get purchase order with joined data
  // TODO: Add budget data
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
    throw new Error("Failed to retrieve purchase order: " + poError.message);
  }

  if (!purchaseOrder) {
    throw new Error("Purchase order not found");
  }

  // Get purchase order items
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
    throw new Error(
      "Failed to retrieve purchase order items: " + itemsError.message
    );
  }

  // Combine the data
  const result = {
    ...purchaseOrder,
    items: items || [],
  };

  return NextResponse.json(success(result), { status: 200 });
}
