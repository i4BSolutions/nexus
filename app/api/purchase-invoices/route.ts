import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

import { PurchaseInvoiceInterface } from "@/types/purchase-invoice/purchase-invoice.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import { PurchaseOrderItemInterface } from "@/types/purchase-order/purchase-order-item.type";
import { PurchaseInvoiceItemInterface } from "@/types/purchase-invoice/purchase-invoice-item.type";

// Step 1: Get Purchase Order Items Quantity
async function getPurchaseOrderItems(
  purchase_order_id: number
): Promise<PurchaseOrderItemInterface[]> {
  const supabase = await createClient();

  const { data: purchaseOrderItems, error: purchaseOrderItemsError } =
    await supabase
      .from("purchase_order_items")
      .select("*")
      .eq("purchase_order_id", purchase_order_id);

  if (purchaseOrderItemsError) {
    throw new Error(purchaseOrderItemsError.message);
  }

  return purchaseOrderItems;
}

// Step 2: Check if the purchase order items quantity is greater than the purchase invoice items quantity
async function checkPurchaseOrderItemsQuantity(
  purchaseOrderItems: any,
  invoiceItems: any,
  purchase_order_id: number
) {
  const supabase = await createClient();

  // Fetch all previous invoice items for this purchase order
  const { data: previousInvoiceItems, error } = await supabase
    .from("purchase_invoice_item")
    .select("product_id, quantity")
    .eq("purchase_order_id", purchase_order_id);

  if (error) throw new Error(error.message);

  // Sum previous quantities by product_id
  const previousQuantities: Record<number, number> = {};

  for (const item of previousInvoiceItems) {
    previousQuantities[item.product_id] =
      (previousQuantities[item.product_id] || 0) + item.quantity;
  }

  // Map purchase order items by product_id for easy lookup
  const poItemMap = Object.fromEntries(
    purchaseOrderItems.map((item: any) => [item.product_id, item])
  );

  // Check each item in the new invoice
  for (const invoiceItem of invoiceItems) {
    const poItem = poItemMap[invoiceItem.product_id];
    if (!poItem) return false; // Product not in purchase order

    const prevQty = previousQuantities[invoiceItem.product_id] || 0;
    const availableQty = poItem.quantity - prevQty;

    if (invoiceItem.quantity > availableQty) {
      return false; // Exceeds available quantity
    }
  }

  return true;
}
/**
 * This API route creates a purchase invoice.
 * @param req - NextRequest object
 * @returns NextResponse ApiResponse<PurchaseInvoiceInterface | null>
 */
export async function POST(
  req: NextRequest
): Promise<
  NextResponse<ApiResponse<PurchaseInvoiceInterface> | ApiResponse<null>>
> {
  const supabase = await createClient();
  const body = await req.json();

  const {
    purchase_invoice_number,
    purchase_order_id,
    invoice_date,
    due_date,
    currency_id,
    usd_exchange_rate,
    note,
    status,
    invoice_items,
  } = body;

  // Step 1: Get Purchase Order Items Quantity
  const purchaseOrderItems = await getPurchaseOrderItems(purchase_order_id);

  if (!purchaseOrderItems || purchaseOrderItems.length === 0) {
    return NextResponse.json(error("Purchase order items not found"), {
      status: 404,
    });
  }

  // Step 2: Check if the purchase order items quantity is greater than the purchase invoice items quantity
  const isPurchaseOrderItemsQuantityGreater =
    await checkPurchaseOrderItemsQuantity(
      purchaseOrderItems,
      invoice_items,
      purchase_order_id
    );

  if (!isPurchaseOrderItemsQuantityGreater) {
    return NextResponse.json(
      error(
        "Purchase order items available quantity is less than the purchase invoice items quantity"
      ),
      {
        status: 400,
      }
    );
  }

  // Step 3: Create purchase invoice
  const invoiceData = {
    purchase_invoice_number,
    purchase_order_id,
    invoice_date,
    due_date,
    currency_id,
    exchange_rate_to_usd: usd_exchange_rate,
    note,
    status,
  };

  const { data: invoice, error: invoiceError } = await supabase
    .from("purchase_invoice")
    .insert(invoiceData)
    .select()
    .single();

  if (invoiceError) {
    return NextResponse.json(error(invoiceError.message), { status: 500 });
  }

  const itemsToInsert = (invoice_items || []).map((item: any) => ({
    purchase_invoice_id: invoice.id,
    purchase_order_id: purchase_order_id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price_local: item.unit_price_local,
  }));

  if (itemsToInsert.length > 0) {
    const { error: itemsError } = await supabase
      .from("purchase_invoice_item")
      .insert(itemsToInsert);

    if (itemsError) {
      return NextResponse.json(error(itemsError.message), { status: 500 });
    }
  }

  return NextResponse.json(
    success(invoice, "Purchase invoice created successfully"),
    { status: 200 }
  );
}
