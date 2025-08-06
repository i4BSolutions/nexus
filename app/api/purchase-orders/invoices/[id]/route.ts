import { createClient } from "@/lib/supabase/server";
import { error, success } from "@/lib/api-response";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/shared/api-response-type";
import { InvoiceHistory } from "@/types/purchase-order/purchase-order-detail.type";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<InvoiceHistory | null>>> {
  const supabase = await createClient();
  const { id: poId } = await context.params;
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSizeParam = searchParams.get("pageSize") || "10";
  const pageSize = parseInt(pageSizeParam, 10);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Get all invoice data (not paginated) to calculate stats
  const { data: allInvoices, error: allError } = await supabase
    .from("purchase_invoice")
    .select(
      `
        id,
        status,
        exchange_rate_to_usd,
        currency:currency_id(currency_code),
        purchase_order:purchase_order_id(supplier(name)),
        invoice_items:purchase_invoice_item (
          product_id,
          quantity,
          unit_price_local
        )
      `
    )
    .eq("purchase_order_id", poId)
    .eq("is_voided", false);

  console.log("All Invoices Data:", allInvoices);

  if (allError) {
    return NextResponse.json(error("Failed to calculate invoice stats"), {
      status: 500,
    });
  }

  // Metrics calculation
  let totalAmountUSD = 0;
  let totalPaidUSD = 0;
  let allInvoicedProductIds = new Set<string>();

  allInvoices.forEach((invoice) => {
    let invoiceTotalUSD = 0;

    invoice.invoice_items?.forEach((item) => {
      const itemUSD =
        (item.quantity * item.unit_price_local) / invoice.exchange_rate_to_usd;
      invoiceTotalUSD += itemUSD;
      allInvoicedProductIds.add(item.product_id);
    });

    totalAmountUSD += invoiceTotalUSD;

    if (invoice.status === "Paid") {
      totalPaidUSD += invoiceTotalUSD;
    }
  });

  const totalInvoices = allInvoices.length;
  const totalInvoicedItems = allInvoicedProductIds.size;
  const totalRemainingUSD = totalAmountUSD - totalPaidUSD;

  // Fetch PO items to determine remaining items
  const { data: poItems, error: poError } = await supabase
    .from("purchase_order_items")
    .select("product_id")
    .eq("purchase_order_id", poId);

  if (poError) {
    return NextResponse.json(error("Failed to fetch PO items"), {
      status: 500,
    });
  }

  const totalPOItems = new Set(poItems?.map((item) => item.product_id)).size;
  const totalRemainingItems = totalPOItems - totalInvoicedItems;

  // Paginated fetch of invoices
  let pagedQuery = supabase
    .from("purchase_invoice")
    .select(
      `
        *,
        currency:currency_id (currency_code),
        purchase_order:purchase_order_id(supplier(name)),
        invoice_items:purchase_invoice_item (
          product_id,
          quantity,
          unit_price_local
        )
      `,
      { count: "exact" }
    )
    .eq("purchase_order_id", poId)
    .eq("is_voided", false)
    .order("invoice_date", { ascending: false });

  pagedQuery = pagedQuery.range(from, to);
  const { data: items, error: fetchError, count } = await pagedQuery;

  if (fetchError) {
    return NextResponse.json(error("Failed to fetch paginated invoices"), {
      status: 500,
    });
  }

  const dto = items.map((item) => ({
    id: item.id,
    invoice_no: item.purchase_invoice_number,
    supplier: item.purchase_order?.supplier?.name || "",
    invoice_date: item.invoice_date,
    due_date: item.due_date,
    amount_local: item.invoice_items.reduce(
      (total: number, item: { quantity: number; unit_price_local: number }) =>
        total + item.quantity * item.unit_price_local,
      0
    ),
    amount_usd: item.invoice_items.reduce(
      (
        total: number,
        line_item: { quantity: number; unit_price_local: number }
      ) =>
        total +
        (line_item.quantity * line_item.unit_price_local) /
          item.exchange_rate_to_usd,
      0
    ),
    currency_code: item.currency?.currency_code || "",
    status: item.status,
  }));

  return NextResponse.json(
    success({
      invoices: dto,
      statistics: {
        total_invoices: totalInvoices,
        total_amount_usd: parseFloat(totalAmountUSD.toFixed(2)),
        total_paid_usd: parseFloat(totalPaidUSD.toFixed(2)),
        total_remaining_usd: parseFloat(totalRemainingUSD.toFixed(2)),
        total_paid_percent:
          totalAmountUSD > 0 ? (totalPaidUSD / totalAmountUSD) * 100 : 0,
        total_invoiced_items: totalInvoicedItems,
        total_remaining_items: totalRemainingItems,
        total_invoiced_items_percentage:
          totalPOItems > 0 ? (totalInvoicedItems / totalPOItems) * 100 : 0,
      },
      total: count || 0,
      page,
      pageSize,
    }),
    { status: 200 }
  );
}
