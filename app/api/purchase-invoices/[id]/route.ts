import { getAuthenticatedUser } from "@/helper/getUser";
import { createClient } from "@/lib/supabase/server";

import { NextRequest, NextResponse } from "next/server";

import { ApiResponse } from "@/types/shared/api-response-type";

import { error, success } from "@/lib/api-response";
import { PurchaseInvoiceInterface } from "@/types/purchase-invoice/purchase-invoice.type";

// Fetch purchase invoices with relations
async function fetchPurchaseInvoiceWithJoins(supabase: any, idStr: string) {
  const relations = [
    "*",
    "purchase_invoice_item(*)",
    "currency:currency_id(currency_code, currency_name)",
  ];

  return await supabase
    .from("purchase_invoice")
    .select(relations.join(",\n"))
    .eq("id", idStr)
    .single();
}

// fetch purchase invoice items by purchase invoice id
async function fetchPurchaseInvoiceItemsById(supabase: any, idStr: string) {
  return await supabase
    .from("purchase_invoice_item")
    .select("*, product:product_id(*)")
    .eq("purchase_invoice_id", idStr);
}

// map the purchase invoice items
function mapPurchaseInvoiceItems(items: any[], usdExchangeRate: number) {
  return items.map((item) => ({
    id: item.id,
    product_id: item.product_id,
    product_name: item.product.name,
    quantity: item.quantity,
    unit_price_local: item.unit_price_local,
    unit_price_usd: item.unit_price_local / usdExchangeRate,
    sub_total_local: item.unit_price_local * item.quantity,
    sub_total_usd: (item.unit_price_local * item.quantity) / usdExchangeRate,
  }));
}

// format the purchase invoice items
function formattedPurchaseInvoiceItems(
  items: any[],
  purchase_order: any,
  ordered: number,
  available: number
) {
  return items.map((item) => {
    // Find the matching purchase order item by product_id
    const poItem = purchase_order.purchase_order_items.find(
      (po: any) => po.product_id === item.product_id
    );

    return {
      ...item,
      total_ordered: ordered,
      total_available: available,
      po_unit_price_local: poItem ? poItem.unit_price_local : undefined,
      po_unit_price_usd: poItem
        ? poItem.unit_price_local / purchase_order.usd_exchange_rate
        : undefined,
    };
  });
}

// Fetch purchase invoice items by purchase order id to calculate ordered and available
async function fetchPurchaseInvoiceItemsByPoId(
  supabase: any,
  purchaseOrderId: string
) {
  return await supabase
    .from("purchase_invoice_item")
    .select("*, product:product_id(*)")
    .eq("purchase_order_id", purchaseOrderId);
}

// Fetch purchase order by purchase order id
async function fetchPurchaseOrder(supabase: any, purchaseOrderId: string) {
  return await supabase
    .from("purchase_order")
    .select(
      "*, currency:currency_id(currency_code, currency_name), purchase_order_items(*)"
    )
    .eq("id", purchaseOrderId)
    .single();
}

/**
 * Handles GET requests to retrieve a purchase invoice by its purchase_invoice_number.
 *
 * @param req - The incoming Next.js request object.
 * @param context - An object containing route parameters, specifically a promise resolving to the invoice ID.
 * @returns A promise that resolves to a NextResponse containing either:
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<PurchaseInvoiceInterface> | any>> {
  const supabase = await createClient();
  const { id: idStr } = await context.params;

  // Step 1: Get PI Item by ID
  const { data: piItem, error: piItemError } = await supabase
    .from("purchase_invoice_item")
    .select("*, product:product_id(*)")
    .eq("purchase_invoice_id", idStr)
    .single();

  if (piItemError || !piItem) {
    return NextResponse.json(error("Purchase invoice item not found"), {
      status: 404,
    });
  }

  // Step 2: Get PI Details by PI Item’s invoice ID
  const { data: invoice, error: invoiceError } =
    await fetchPurchaseInvoiceWithJoins(supabase, piItem.purchase_invoice_id);

  if (invoiceError || !invoice) {
    return NextResponse.json(error("Purchase invoice not found"), {
      status: 404,
    });
  }

  // Step 3: Get PO items by PO ID
  const { data: purchaseOrder, error: poError } = await fetchPurchaseOrder(
    supabase,
    invoice.purchase_order_id
  );

  if (poError || !purchaseOrder) {
    return NextResponse.json(error("Purchase order not found"), {
      status: 404,
    });
  }

  const productId = piItem.product_id;

  const totalOrdered = purchaseOrder.purchase_order_items
    .filter((item: any) => item.product_id === productId)
    .reduce((sum: number, item: any) => sum + item.quantity, 0);

  // Step 4: Get all PI Items by same PO ID
  const { data: allPIItems, error: allPIError } =
    await fetchPurchaseInvoiceItemsByPoId(supabase, invoice.purchase_order_id);

  if (allPIError) {
    return NextResponse.json(error("Failed to load related PI items"), {
      status: 500,
    });
  }

  const totalInvoiced = allPIItems
    .filter((item: any) => item.product_id === productId)
    .reduce((sum: number, item: any) => sum + item.quantity, 0);

  // Step 5: Calculate available quantity
  const availableQty = totalOrdered - totalInvoiced;

  // Finally, fetch current PI’s item list to respond
  const { data: invoiceItems, error: itemsError } =
    await fetchPurchaseInvoiceItemsById(supabase, invoice.id);

  const mappedItems = mapPurchaseInvoiceItems(
    invoiceItems,
    invoice.exchange_rate_to_usd
  );

  const formattedItems = formattedPurchaseInvoiceItems(
    mappedItems,
    purchaseOrder,
    totalInvoiced,
    availableQty
  );

  const formattedInvoice: PurchaseInvoiceInterface = {
    id: invoice.id,
    purchase_invoice_number: invoice.purchase_invoice_number,
    invoice_date: invoice.invoice_date,
    due_date: invoice.due_date,
    currency_code: invoice.currency.currency_code,
    usd_exchange_rate: invoice.exchange_rate_to_usd,
    status: invoice.status,
    note: invoice.note || "",
    invoice_items: formattedItems || [],
    purchase_order_id: purchaseOrder.id,
    purchase_order_no: purchaseOrder.purchase_order_no,
    purchase_order_currency_code: purchaseOrder.currency.currency_code,
    purchase_order_exchange_rate: purchaseOrder.usd_exchange_rate,
  };

  return NextResponse.json(
    success(formattedInvoice, "Purchase invoice retrieved successfully"),
    { status: 200 }
  );
}

// Creates audit log entries for changes made to a purchase invoice.
async function createPurchaseInvoiceAuditLogEntries(
  supabase: any,
  invoiceId: number,
  userId: string,
  oldData: any,
  newData: any
) {
  const auditEntries: Array<{
    purchase_invoice_id: number;
    changed_by: string;
    changed_field: string;
    old_values: string;
    new_values: string;
    changed_at?: string;
  }> = [];

  Object.keys(newData).forEach((key) => {
    if (key !== "updated_at" && oldData[key] !== newData[key]) {
      auditEntries.push({
        purchase_invoice_id: invoiceId,
        changed_by: userId,
        changed_field: key,
        old_values: String(oldData[key]),
        new_values: String(newData[key]),
        changed_at: new Date().toISOString(),
      });
    }
  });

  if (auditEntries.length > 0) {
    const { error: auditError } = await supabase
      .from("pruchase_invoice_audit_log")
      .insert(auditEntries);

    if (auditError) {
      console.error("Error creating audit log entries:", auditError.message);
    }
  }
}

/**
 * This API route updates a purchase invoice by ID.
 * @param req - NextRequest object
 * @param context - Context object
 * @returns NextResponse with the result of the operation
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  const supabase = await createClient();

  const { id } = await context.params;

  const body = await req.json();
  const reason = body.reason;

  // Get authenticated user
  const user = await getAuthenticatedUser(supabase);

  // Fetch current purchase invoice before update
  const { data: currentInvoice, error: currentError } = await supabase
    .from("purchase_invoice")
    .select("*")
    .eq("id", id)
    .single();

  if (!currentInvoice) {
    return NextResponse.json(error("Purchase invoice not found"), {
      status: 404,
    });
  }

  if (currentError) {
    return NextResponse.json(error(currentError.message), { status: 500 });
  }

  const updatableFields = [
    "invoice_date",
    "due_date",
    "status",
    "exchange_rate_to_usd",
    "note",
    "is_voided",
  ];

  const updateData: Record<string, any> = {};
  for (const field of updatableFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      updateData[field] = body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(error("No valid fields provided for update"), {
      status: 400,
    });
  }

  // update
  const { data: updatedInvoice, error: updateError } = await supabase
    .from("purchase_invoice")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (!updatedInvoice) {
    return NextResponse.json(error("Purchase invoice not found after update"), {
      status: 404,
    });
  }

  if (updateError) {
    return NextResponse.json(error(updateError.message), {
      status: 500,
    });
  }

  // Create audit log entries using actual updated values
  await createPurchaseInvoiceAuditLogEntries(
    supabase,
    Number(id),
    user?.id || "system",
    currentInvoice,
    updatedInvoice
  );

  if (!body.is_voided) {
    // Log the reason for update
    const { error: purchaseInvoiceUpdateReasonError } = await supabase
      .from("purchase_invoice_update_reason")
      .insert({
        purchase_invoice_id: id,
        reason,
        action: "update",
      });

    if (purchaseInvoiceUpdateReasonError) {
      return NextResponse.json(
        error(purchaseInvoiceUpdateReasonError.message),
        {
          status: 500,
        }
      );
    }
  }

  return NextResponse.json(
    success({
      message: "Purchase invoice updated successfully",
      data: updatedInvoice,
    }),
    { status: 200 }
  );
}
