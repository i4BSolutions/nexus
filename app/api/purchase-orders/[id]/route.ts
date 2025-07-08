import { getAuthenticatedUser } from "@/helper/getUser";
import { createClient } from "@/lib/supabase/server";

import { NextRequest, NextResponse } from "next/server";

import { ApiResponse } from "@/types/shared/api-response-type";
import { GetPurchaseOrderDetailDto } from "@/types/purchase-order/purchase-order.type";

import { error, success } from "@/lib/api-response";

// Helper: Fetch purchase order with joined data
async function fetchPurchaseOrderWithJoins(supabase: any, idStr: string) {
  const selectFields = [
    "*",
    "supplier:supplier_id(name, contact_person, email, phone, address, status)",
    "region:region_id(name)",
    "currency:currency_id(currency_code, currency_name)",
    "contact_person:contact_person_id(name)",
    "sign_person:sign_person_id(name)",
    "authorized_signer:authorized_signer_id(name)",
    "budget:budget_id(budget_name, project_name, description, status)",
  ];

  return await supabase
    .from("purchase_order")
    .select(selectFields.join(",\n"))
    .eq("id", idStr)
    .single();
}

// Helper: Fetch purchase order items with product info
async function fetchPurchaseOrderItems(supabase: any, idStr: string) {
  return await supabase
    .from("purchase_order_items")
    .select("*, product:product_id(name, sku, description)")
    .eq("purchase_order_id", idStr);
}

// Helper: Format items for DTO
function formatPurchaseOrderItems(items: any[], usdExchangeRate: number) {
  return (
    items?.map((item) => ({
      id: item.id,
      product_name: item.product?.name || `Product ID: ${item.product_id}`,
      quantity: item.quantity,
      unit_price_local: item.unit_price_local,
      unit_price_usd: item.unit_price_local / usdExchangeRate,
      sub_total_local: item.quantity * item.unit_price_local,
      sub_total_usd: (item.quantity * item.unit_price_local) / usdExchangeRate,
    })) || []
  );
}

// Helper: Calculate totals
function calculateTotals(items: any[], usdExchangeRate: number) {
  const totalAmountLocal =
    items?.reduce(
      (sum, item) => sum + item.quantity * item.unit_price_local,
      0
    ) || 0;
  const totalAmountUSD = totalAmountLocal / usdExchangeRate;
  return { totalAmountLocal, totalAmountUSD };
}

// Helper: Build DTO for response
function buildPurchaseOrderDetailDto(
  purchaseOrder: any,
  formattedItems: any[],
  totalAmountLocal: number,
  totalAmountUSD: number
): GetPurchaseOrderDetailDto {
  return {
    id: purchaseOrder.id,
    purchase_order_no: purchaseOrder.purchase_order_no,
    supplier: purchaseOrder.supplier?.name || "Unknown Supplier",
    region: purchaseOrder.region?.name || "Unknown Region",
    order_date: purchaseOrder.order_date,
    expected_delivery_date: purchaseOrder.expected_delivery_date,
    budget: purchaseOrder.budget?.budget_name || "Unknown Budget",
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
}

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
  const { data: purchaseOrder, error: poError } =
    await fetchPurchaseOrderWithJoins(supabase, idStr);

  if (!purchaseOrder) {
    return NextResponse.json(error("Purchase order not found"), {
      status: 404,
    });
  }

  if (poError) {
    return NextResponse.json(error(poError.message), { status: 500 });
  }

  // Get purchase order items with product information
  const { data: items, error: itemsError } = await fetchPurchaseOrderItems(
    supabase,
    idStr
  );

  if (itemsError) {
    return NextResponse.json(error(itemsError.message), { status: 500 });
  }

  // Calculate totals
  const { totalAmountLocal, totalAmountUSD } = calculateTotals(
    items,
    purchaseOrder.usd_exchange_rate
  );

  // Format items for the DTO
  const formattedItems = formatPurchaseOrderItems(
    items,
    purchaseOrder.usd_exchange_rate
  );

  // Format the response according to GetPurchaseOrderDetailDto
  const result = buildPurchaseOrderDetailDto(
    purchaseOrder,
    formattedItems,
    totalAmountLocal,
    totalAmountUSD
  );

  return NextResponse.json(success(result), { status: 200 });
}

// Helper function to create audit log entries for purchase order updates
async function createPurchaseOrderAuditLogEntries(
  supabase: any,
  purchaseOrderId: number,
  userId: string,
  currentOrder: any,
  updatedOrder: any
) {
  const auditEntries: Array<{
    purchase_order_id: number;
    changed_by: string;
    changed_field: string;
    old_values: string;
    new_values: string;
    changed_at?: string;
  }> = [];

  Object.keys(updatedOrder).forEach((key) => {
    if (key !== "updated_at" && currentOrder[key] !== updatedOrder[key]) {
      auditEntries.push({
        purchase_order_id: purchaseOrderId,
        changed_by: userId,
        changed_field: key,
        old_values: String(currentOrder[key]),
        new_values: String(updatedOrder[key]),
        changed_at: new Date().toISOString(),
      });
    }
  });

  if (auditEntries.length > 0) {
    const { error: auditError } = await supabase
      .from("pruchase_orders_audit_log")
      .insert(auditEntries);
    if (auditError) {
      console.error("Failed to log purchase order audit entries:", auditError);
    }
  }
}

/**
 * This API route updates a purchase order by ID.
 * @param req - NextRequest object
 * @param context - Context object
 * @returns NextResponse ApiResponse<GetPurchaseOrderDetailDto | null>
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<GetPurchaseOrderDetailDto | null>>> {
  const supabase = await createClient();
  const { id: idStr } = await context.params;
  const body = await req.json();
  const reason = body.reason;

  const { error: purchaseOrderUpdateReasonError } = await supabase
    .from("purchase_order_update_reason")
    .insert({
      purchase_order_id: idStr,
      reason,
      action: "update",
    });

  if (purchaseOrderUpdateReasonError) {
    return NextResponse.json(error(purchaseOrderUpdateReasonError.message), {
      status: 500,
    });
  }

  // Get authenticated user
  const user = await getAuthenticatedUser(supabase);

  // Fetch current purchase order before update
  const { data: currentOrder, error: currentError } = await supabase
    .from("purchase_order")
    .select("*")
    .eq("id", idStr)
    .single();

  if (!currentOrder) {
    return NextResponse.json(error("Purchase order not found"), {
      status: 404,
    });
  }

  if (currentError) {
    return NextResponse.json(error(currentError.message), { status: 500 });
  }

  // List of fields that can be updated (excluding purchase_order_no)
  const updatableFields = [
    "supplier_id",
    "region_id",
    "budget_id",
    "order_date",
    "currency_id",
    "usd_exchange_rate",
    "contact_person_id",
    "sign_person_id",
    "authorized_signer_id",
    "status",
    "note",
    "expected_delivery_date",
  ];

  // Build updateData with only fields present in the payload
  const updateData: Record<string, any> = {};
  for (const field of updatableFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      updateData[field] = body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(error("No updatable fields provided"), {
      status: 400,
    });
  }

  // Update the purchase order
  const { data: updatedOrder, error: updateError } = await supabase
    .from("purchase_order")
    .update(updateData)
    .eq("id", idStr)
    .select()
    .single();

  if (!updatedOrder) {
    return NextResponse.json(error("Purchase order not found"), {
      status: 404,
    });
  }

  if (updateError) {
    return NextResponse.json(error(updateError.message), { status: 500 });
  }

  // Audit log: log all changed fields
  await createPurchaseOrderAuditLogEntries(
    supabase,
    Number(idStr),
    user?.id || "system",
    currentOrder,
    { ...currentOrder, ...updateData }
  );

  // Fetch the updated purchase order with joined data (reuse GET logic, but include budget join)
  const { data: purchaseOrder, error: poError } =
    await fetchPurchaseOrderWithJoins(supabase, idStr);

  if (poError) {
    return NextResponse.json(error(poError.message), { status: 500 });
  }

  // Get purchase order items with product information
  const { data: items, error: itemsError } = await fetchPurchaseOrderItems(
    supabase,
    idStr
  );

  if (itemsError) {
    return NextResponse.json(error(itemsError.message), { status: 500 });
  }

  // Calculate totals
  const { totalAmountLocal, totalAmountUSD } = calculateTotals(
    items,
    purchaseOrder.usd_exchange_rate
  );

  // Format items for the DTO
  const formattedItems = formatPurchaseOrderItems(
    items,
    purchaseOrder.usd_exchange_rate
  );

  // Format the response according to GetPurchaseOrderDetailDto
  const result = buildPurchaseOrderDetailDto(
    purchaseOrder,
    formattedItems,
    totalAmountLocal,
    totalAmountUSD
  );

  return NextResponse.json(
    success(result, "Purchase order updated successfully"),
    { status: 200 }
  );
}

/**
 * This API route deletes a purchase order by ID.
 * The system will not allow deletion if the purchase order has any associated invoices.
 * @param _req - NextRequest object
 * @param context - Context object
 * @returns NextResponse ApiResponse<null>
 */
// TODO: Should not be able to delete if there are associated invoices.
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  const supabase = await createClient();
  const { id: idStr } = await context.params;

  const { data: purchaseOrder, error: poError } =
    await fetchPurchaseOrderWithJoins(supabase, idStr);

  if (!purchaseOrder) {
    return NextResponse.json(error("Purchase order not found"), {
      status: 404,
    });
  }

  if (poError) {
    return NextResponse.json(error(poError.message), { status: 500 });
  }

  // Delete all related purchase_order_items first
  const { error: itemsDeleteError } = await supabase
    .from("purchase_order_items")
    .delete()
    .eq("purchase_order_id", idStr);

  if (itemsDeleteError) {
    return NextResponse.json(error(itemsDeleteError.message), { status: 500 });
  }

  // Now delete the purchase order itself
  const { error: deleteError } = await supabase
    .from("purchase_order")
    .delete()
    .eq("id", idStr);

  if (deleteError) {
    return NextResponse.json(error(deleteError.message), { status: 500 });
  }

  return NextResponse.json(
    success(null, "Purchase order and related items deleted successfully"),
    {
      status: 200,
    }
  );
}
