import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { PurchaseInvoiceDto } from "@/types/purchase-invoice/purchase-invoice.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import { SupplierInvoiceHistoryResponse } from "@/types/supplier/supplier.type";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

/**
 * This API route retrieves history of invoices by supplier ID.
 * @param req - NextRequest object
 * @param context - Context object
 * @returns NextResponse ApiResponse<SupplierInvoiceHistoryResponse | null>
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<SupplierInvoiceHistoryResponse | null>>> {
  const { id: idStr } = await context.params;
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSizeParam = searchParams.get("pageSize") || "3";
  const pageSize = parseInt(pageSizeParam, 10);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    // Step 1: Get all purchase_order_ids for this supplier
    const { data: poIds, error: poErr } = await supabase
      .from("purchase_order")
      .select("id")
      .eq("supplier_id", idStr);

    if (poErr) {
      return NextResponse.json(error("Error fetching purchase orders"), {
        status: 500,
      });
    }

    const purchaseOrderIds = poIds?.map((po) => po.id) ?? [];

    if (purchaseOrderIds.length === 0) {
      return NextResponse.json(
        success(
          {
            data: [],
            total: 0,
            page,
            pageSize,
          },
          "No invoices found for this supplier"
        )
      );
    }

    // Step 2: Query invoices with filter + joins
    let query = supabase
      .from("purchase_invoice")
      .select(
        `
      id,
      purchase_invoice_number,
      purchase_order:purchase_order_id (
        purchase_order_no,
        supplier:supplier_id (
          id,
          name
        )
      ),
      invoice_date,
      due_date,
      product_currency (
        currency_code
      ),
      exchange_rate_to_usd,
      status,
      note,
      invoice_items:purchase_invoice_item (
        product_id,
        quantity,
        unit_price_local
      )
    `,
        { count: "exact" }
      )
      .in("purchase_order_id", purchaseOrderIds)
      .range(from, to)
      .order("invoice_date", { ascending: false });

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

    let formatDto: any = invoices?.map((invoice) => ({
      id: invoice.id,
      purchase_invoice_number: invoice.purchase_invoice_number,
      purchase_order_no: invoice.purchase_order.purchase_order_no,
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
      supplier_name: invoice.purchase_order.supplier.name || "Unknown",
    }));

    const data: SupplierInvoiceHistoryResponse = {
      data: formatDto,
      total: count || 0,
      page,
      pageSize: pageSize,
    };

    return NextResponse.json(
      success(data, "Purchase order history retrieved successfully"),
      {
        status: 200,
      }
    );
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Invalid request";
    const statusCode = errorMessage.includes("Unauthorized")
      ? 401
      : errorMessage.includes("Invalid supplier ID")
      ? 400
      : errorMessage.includes("Purchase order history not found")
      ? 404
      : 500;

    return NextResponse.json(error(errorMessage, statusCode), {
      status: statusCode,
    });
  }
}
