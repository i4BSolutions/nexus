import { getAuthenticatedUser } from "@/helper/getUser";
import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { PurchaseOrderDetailDto } from "@/types/purchase-order/purchase-order-detail.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";

// Helper: Fetch purchase order with joined data
async function fetchPurchaseOrderWithJoins(supabase: any, idStr: string) {
  const selectFields = [
    "*",
    "supplier:supplier_id(id, name, contact_person, email, phone, address, status)",
    "region:region_id(id, name)",
    "currency:currency_id(id, currency_code, currency_name)",
    "contact_person:contact_person_id(id, name)",
    "sign_person:sign_person_id(id, name)",
    "authorized_signer:authorized_signer_id(id, name)",
    "budget:budget_id(id, budget_name, project_name, description, status)",
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
    .select("*, product:product_id(id, name, sku, description)")
    .eq("purchase_order_id", idStr);
}

// Helper: Format items for DTO
function formatPurchaseOrderItems(items: any[], usdExchangeRate: number) {
  return (
    items?.map((item) => ({
      id: item.id,
      product: item.product.id,
      product_name: item.product?.name,
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
): PurchaseOrderDetailDto {
  return {
    id: purchaseOrder.id,
    purchase_order_no: purchaseOrder.purchase_order_no,
    supplier: {
      id: purchaseOrder.supplier?.id || 0,
      name: purchaseOrder.supplier?.name || "Unknown Supplier",
    },
    region: {
      id: purchaseOrder.region?.id || 0,
      name: purchaseOrder.region?.name || "Unknown Region",
    },
    order_date: purchaseOrder.order_date,
    expected_delivery_date: purchaseOrder.expected_delivery_date,
    budget: {
      id: purchaseOrder.budget?.id || 0,
      name: purchaseOrder.budget?.budget_name || "Unknown Budget",
    },
    currency: {
      id: purchaseOrder.currency?.id,
      currency_code: purchaseOrder.currency?.currency_code,
      currency_name: purchaseOrder.currency?.currency_name,
    },
    usd_exchange_rate: purchaseOrder.usd_exchange_rate,
    product_items: formattedItems,
    total_amount_local: totalAmountLocal,
    total_amount_usd: totalAmountUSD,
    contact_person: purchaseOrder.contact_person
      ? {
          id: purchaseOrder.contact_person.id,
          name: purchaseOrder.contact_person.name,
        }
      : null,
    sign_person: purchaseOrder.sign_person
      ? {
          id: purchaseOrder.sign_person?.id,
          name: purchaseOrder.sign_person?.name,
        }
      : null,
    authorized_sign_person: purchaseOrder.authorized_signer
      ? {
          id: purchaseOrder.authorized_signer?.id,
          name: purchaseOrder.authorized_signer?.name,
        }
      : null,
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
): Promise<NextResponse<ApiResponse<PurchaseOrderDetailDto | null>>> {
  const supabase = await createClient();
  const { id: idStr } = await context.params;

  // Get purchase order with joined data
  const { data: purchaseOrder, error: poError } =
    await fetchPurchaseOrderWithJoins(supabase, idStr);

  if (poError) {
    return NextResponse.json(error(poError.message), { status: 500 });
  }

  if (!purchaseOrder) {
    return NextResponse.json(error("Purchase order not found"), {
      status: 404,
    });
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
  console.log("Purchase Order Detail:", result);
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
      return NextResponse.json(error(auditError.message), { status: 500 });
    }
  }
}

// Helper function to create audit log entries for purchase order item updates
async function createPurchaseOrderItemAuditLogEntries(
  supabase: any,
  purchaseOrderId: number,
  userId: string,
  currentItems: any[], // Array of current DB items
  updatedItems: any[] // Array of updated payload items
) {
  const auditEntries: Array<{
    purchase_order_id: number;
    purchase_order_item_id: number;
    changed_by: string;
    changed_field: string;
    old_values: string;
    new_values: string;
    changed_at?: string;
  }> = [];

  for (const updatedItem of updatedItems) {
    const currentItem = currentItems.find((ci) => ci.id === updatedItem.id);
    if (!currentItem) continue;
    for (const key of Object.keys(updatedItem)) {
      if (
        key !== "updated_at" &&
        key !== "id" &&
        updatedItem[key] !== undefined &&
        currentItem[key] !== updatedItem[key]
      ) {
        auditEntries.push({
          purchase_order_id: purchaseOrderId,
          purchase_order_item_id: updatedItem.id,
          changed_by: userId,
          changed_field: key,
          old_values: String(currentItem[key]),
          new_values: String(updatedItem[key]),
          changed_at: new Date().toISOString(),
        });
      }
    }
  }

  if (auditEntries.length > 0) {
    const { error: auditError } = await supabase
      .from("pruchase_orders_item_audit_log")
      .insert(auditEntries);

    if (auditError) {
      return NextResponse.json(error(auditError.message), { status: 500 });
    }
  }
}

// Helper function to update purchase order items
async function updatePurchaseOrderItems(
  supabase: any,
  purchaseOrderId: string,
  items: Array<{
    id: number;
    product_id?: number;
    quantity?: number;
    unit_price_local?: number;
  }>
) {
  // Validate items structure
  if (!Array.isArray(items)) {
    throw new Error("Items must be an array");
  }

  // Fetch existing items for this purchase order
  const { data: existingItems, error: fetchError } = await supabase
    .from("purchase_order_items")
    .select("id")
    .eq("purchase_order_id", purchaseOrderId);

  if (fetchError) {
    return NextResponse.json(error(fetchError.message), { status: 500 });
  }

  // Create a Set of valid existing item IDs
  const existingIds = new Set(
    (existingItems || []).map((item: any) => item.id)
  );

  // For each item in the payload, update if it exists
  for (const item of items) {
    if (!item.id || !existingIds.has(item.id)) {
      // Skip items that do not exist in DB
      continue;
    }

    // Build update object with only provided fields
    const updateObj: Record<string, any> = {};

    if (item.product_id !== undefined) updateObj.product_id = item.product_id;

    if (item.quantity !== undefined) updateObj.quantity = item.quantity;

    if (item.unit_price_local !== undefined)
      updateObj.unit_price_local = item.unit_price_local;

    if (Object.keys(updateObj).length === 0) continue; // nothing to update

    const { error: updateError } = await supabase
      .from("purchase_order_items")
      .update(updateObj)
      .eq("id", item.id);
    if (updateError) {
      return NextResponse.json(error(updateError.message), { status: 500 });
    }
  }
  return { success: true };
}

/**
 * This API route updates a purchase order by ID.
 *
 * Request body can include:
 * - reason: string (required) - Reason for the update
 * - items: Array<{product_id: number, quantity: number, unit_price_local: number}> (optional) - Updated items
 * - Any of the updatable fields: supplier_id, region_id, budget_id, order_date, currency_id,
 *   usd_exchange_rate, contact_person_id, sign_person_id, authorized_signer_id, status, note, expected_delivery_date
 *
 * @param req - NextRequest object
 * @param context - Context object
 * @returns NextResponse ApiResponse<GetPurchaseOrderDetailDto | null>
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<PurchaseOrderDetailDto | null>>> {
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

  // Fetch current items before update
  const { data: currentItems, error: currentItemsError } = await supabase
    .from("purchase_order_items")
    .select("*")
    .eq("purchase_order_id", idStr);

  if (currentItemsError) {
    return NextResponse.json(error(currentItemsError.message), { status: 500 });
  }

  // Update purchase order items if provided in the body
  if (body.items && Array.isArray(body.items)) {
    try {
      await updatePurchaseOrderItems(supabase, idStr, body.items);
    } catch (updateError: unknown) {
      const errorMessage =
        updateError instanceof Error
          ? updateError.message
          : "Unknown error occurred";
      return NextResponse.json(
        error(`Failed to update items: ${errorMessage}`),
        {
          status: 500,
        }
      );
    }
    // Audit log: log all changed fields for items
    await createPurchaseOrderItemAuditLogEntries(
      supabase,
      Number(idStr),
      user?.id || "system",
      currentItems,
      body.items
    );
  }

  // Fetch the updated purchase order with joined data
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
