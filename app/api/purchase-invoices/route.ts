import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

import {
  PurchaseInvoiceInterface,
  PurchaseInvoiceResponse,
} from "@/types/purchase-invoice/purchase-invoice.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import { PurchaseOrderItemInterface } from "@/types/purchase-order/purchase-order-item.type";

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

  // Step 4: Determine smart status
  const { data: allPOItems, error: allPOItemsError } = await supabase
    .from("purchase_order_items")
    .select("product_id, quantity")
    .eq("purchase_order_id", purchase_order_id);

  if (allPOItemsError) {
    return NextResponse.json(error(allPOItemsError.message), { status: 500 });
  }

  // Sum all previously invoiced quantities (including this invoice)
  const { data: allInvoiceItems, error: allInvoiceItemsError } = await supabase
    .from("purchase_invoice_item")
    .select("product_id, quantity")
    .eq("purchase_order_id", purchase_order_id);

  if (allInvoiceItemsError) {
    return NextResponse.json(error(allInvoiceItemsError.message), {
      status: 500,
    });
  }

  // Build maps
  const poQuantities: Record<number, number> = {};
  const invoicedQuantities: Record<number, number> = {};

  for (const item of allPOItems) {
    poQuantities[item.product_id] = item.quantity;
  }
  for (const item of allInvoiceItems) {
    invoicedQuantities[item.product_id] =
      (invoicedQuantities[item.product_id] || 0) + item.quantity;
  }

  // Determine if all items are fully invoiced
  let allFullyInvoiced = true;
  let anyInvoiced = false;

  for (const [productIdStr, poQty] of Object.entries(poQuantities)) {
    const productId = Number(productIdStr);
    const invoicedQty = invoicedQuantities[productId] || 0;

    if (invoicedQty > 0) anyInvoiced = true;
    if (invoicedQty < poQty) allFullyInvoiced = false;
  }

  // Choose status
  let smartStatus;
  if (allFullyInvoiced) {
    smartStatus = "Awaiting Delivery";
  } else if (anyInvoiced) {
    smartStatus = "Partially Invoiced";
  }

  // Upsert or insert status
  const { error: smartStatusError } = await supabase
    .from("purchase_order_smart_status")
    .upsert(
      {
        purchase_order_id: purchase_order_id,
        status: smartStatus,
      },
      { onConflict: "purchase_order_id" }
    );

  if (smartStatusError) {
    return NextResponse.json(error(smartStatusError.message), { status: 500 });
  }

  return NextResponse.json(
    success(invoice, "Purchase invoice created successfully"),
    { status: 200 }
  );
}

/**
 * This function retrieves statistics for purchase invoices.
 * It calculates the total number of invoices and the total USD value.
 * @returns Promise<{ total_invoices: number, total_usd: number, delivered: number }>
 */
async function getStatistics() {
  const supabase = await createClient();

  const { data: allInvoicesForStats, error: statsError } = await supabase.from(
    "purchase_invoice"
  ).select(`
      exchange_rate_to_usd,
      invoice_items:purchase_invoice_item (
        id,
        quantity,
        unit_price_local
      )
    `);

  let totalAmountUsd = 0;
  let totalInvoices = 0;
  let totalOrderedQty = 0;

  const itemIdToQuantityMap = new Map<number, number>();

  if (!statsError && allInvoicesForStats) {
    totalInvoices = allInvoicesForStats.length;

    allInvoicesForStats.forEach((invoice) => {
      invoice.invoice_items.forEach((item: any) => {
        totalAmountUsd +=
          (item.quantity * item.unit_price_local) /
          invoice.exchange_rate_to_usd;

        totalOrderedQty += item.quantity;
        itemIdToQuantityMap.set(item.id, item.quantity);
      });
    });
  }

  // Get delivered quantities per invoice item
  const { data: deliveredStats, error: deliveredError } = await supabase
    .from("stock_transaction")
    .select("invoice_line_item_id, quantity")
    .eq("type", "IN");

  let totalDeliveredQty = 0;

  if (!deliveredError && deliveredStats) {
    const deliveredMap = new Map<number, number>();

    deliveredStats.forEach((row) => {
      if (!row.invoice_line_item_id) return;
      const existing = deliveredMap.get(row.invoice_line_item_id) || 0;
      deliveredMap.set(row.invoice_line_item_id, existing + row.quantity);
    });

    deliveredMap.forEach((qty, itemId) => {
      totalDeliveredQty += qty;
    });
  }

  const overallDeliveryPercentage =
    totalOrderedQty > 0 ? (totalDeliveredQty / totalOrderedQty) * 100 : 0;

  return {
    total_invoices: totalInvoices,
    total_usd: parseFloat(totalAmountUsd.toFixed(2)),
    delivered: parseFloat(overallDeliveryPercentage.toFixed(2)),
  };
}

/**
 * This API route retrieves all purchase invoices from the database with
 * pagination support
 * descending order by default
 * and optional filtering by status
 * sorting by invoice number, date, or amount
 * @param req - NextRequest object
 * @returns NextResponse ApiResponse<PurchaseInvoiceResponse>
 */
export async function GET(
  req: NextRequest
): Promise<
  NextResponse<ApiResponse<PurchaseInvoiceResponse> | ApiResponse<any>>
> {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSizeParam = searchParams.get("pageSize") || "10";
  const pageSize = parseInt(pageSizeParam, 10);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const search = searchParams.get("q") || "";

  const status = searchParams.get("status");
  const dateSort = searchParams.get("dateSort");
  const amountSort = searchParams.get("amountSort");

  // Build the query
  let query = supabase.from("purchase_invoice").select(
    `
      id,
      purchase_invoice_number,
      purchase_order_no:purchase_order (purchase_order_no),
      invoice_date,
      due_date,
      product_currency (
        currency_code
      ),
      exchange_rate_to_usd,
      status,
      note,
      invoice_items:purchase_invoice_item (
        id,
        product_id,
        quantity,
        unit_price_local
      )
    `,
    { count: "exact" }
  );

  if (search) {
    query = query.ilike("purchase_invoice_number", `%${search}%`);
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (dateSort === "date_asc") {
    query = query.order("invoice_date", { ascending: true });
  } else if (dateSort === "date_desc") {
    query = query.order("invoice_date", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const needAmountSort =
    amountSort === "amount_asc" || amountSort === "amount_desc";

  if (!needAmountSort) {
    query = query.range(from, to); // apply DB pagination only if sorting by date
  }

  const {
    data: invoices,
    count,
    error: dbError,
  } = (await query) as unknown as {
    data: any[] | null;
    count: number | null;
    error: Error | null;
  };

  if (dbError) {
    return NextResponse.json(error(dbError.message), { status: 500 });
  }

  const { data: deliveredStats, error: deliveredError } = await supabase
    .from("stock_transaction")
    .select("invoice_line_item_id, quantity")
    .eq("type", "IN");

  const deliveredMap = new Map<number, number>();

  deliveredStats?.forEach((row) => {
    if (!row.invoice_line_item_id) return;
    deliveredMap.set(
      row.invoice_line_item_id,
      (deliveredMap.get(row.invoice_line_item_id) || 0) + row.quantity
    );
  });

  let formatDto: any = invoices?.map((invoice) => {
    const totalOrderedQty = invoice.invoice_items.reduce(
      (total: number, item: any) => total + item.quantity,
      0
    );

    const totalDeliveredQty = invoice.invoice_items.reduce(
      (total: number, item: any) => {
        const delivered = deliveredMap.get(item.id) || 0;
        return total + delivered;
      },
      0
    );

    const deliveredPercentage =
      totalOrderedQty > 0 ? (totalDeliveredQty / totalOrderedQty) * 100 : 0;

    const pendingDeliveryPercentage =
      totalOrderedQty > 0
        ? ((totalOrderedQty - totalDeliveredQty) / totalOrderedQty) * 100
        : 0;

    return {
      id: invoice.id,
      purchase_invoice_number: invoice.purchase_invoice_number,
      purchase_order_no: invoice.purchase_order_no.purchase_order_no,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      currency_code: invoice.product_currency.currency_code,
      usd_exchange_rate: invoice.exchange_rate_to_usd,
      total_amount_local: invoice.invoice_items.reduce(
        (total: number, item: { quantity: number; unit_price_local: number }) =>
          total + item.quantity * item.unit_price_local,
        0
      ),
      total_amount_usd: invoice.invoice_items.reduce(
        (total: number, item: { quantity: number; unit_price_local: number }) =>
          total +
          (item.quantity * item.unit_price_local) /
            invoice.exchange_rate_to_usd,
        0
      ),
      status: invoice.status,
      note: invoice.note || "",
      delivered_percentage: Math.min(
        100,
        parseFloat(deliveredPercentage.toFixed(2))
      ),
      pending_delivery_percentage: Math.min(
        100,
        parseFloat(pendingDeliveryPercentage.toFixed(2))
      ),
    };
  });

  if (amountSort === "amount_asc") {
    formatDto.sort((a: any, b: any) => a.total_amount_usd - b.total_amount_usd);
  } else if (amountSort === "amount_desc") {
    formatDto.sort((a: any, b: any) => b.total_amount_usd - a.total_amount_usd);
  }

  if (needAmountSort) {
    formatDto = formatDto.slice(from, to + 1);
  }

  const statisticsData = await getStatistics();

  const data = {
    items: formatDto,
    total: count || 0,
    page,
    pageSize: pageSize,
    statistics: statisticsData,
  };

  return NextResponse.json(
    success(data, "Purchase invoice retrived successfully"),
    { status: 200 }
  );
}
