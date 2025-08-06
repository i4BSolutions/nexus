import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/shared/api-response-type";
import { SupplierPurchaseOrderHistoryResponse } from "@/types/supplier/supplier.type";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

/**
 * This API route retrieves a hisotry of purchase orders by supplier ID.
 * @param req - NextRequest object
 * @param context - Context object
 * @returns NextResponse ApiResponse<SupplierPurchaseOrderHistoryResponse | null>
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<
  NextResponse<ApiResponse<SupplierPurchaseOrderHistoryResponse | null>>
> {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  try {
    // Validate supplier ID
    const { id: idStr } = await context.params;

    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "3", 10);
    let from: number | undefined;
    let to: number | undefined;

    if (pageSize && pageSize !== undefined) {
      from = (page - 1) * pageSize;
      to = from + pageSize - 1;
    }

    let query = supabase
      .from("purchase_order")
      .select(
        `
      id,
      purchase_order_no,
      order_date,
      status,
      product_currency (
        currency_code
      ),
      usd_exchange_rate,
      contact_person:contact_person_id  (
        id,
        name
      ),
      expected_delivery_date,
      purchase_order_items (
        product_id,
        quantity,
        unit_price_local
      ),
      supplier:supplier_id(name),
      purchase_order_smart_status (
        status,
        created_at,
        updated_at
      )
    `,
        { count: "exact" }
      )
      .eq("supplier_id", idStr);

    const {
      data: purchaseOrders,
      count,
      error: getError,
    } = (await query) as unknown as {
      data: any[] | null;
      count: number | null;
      error: any;
    };

    const orders = purchaseOrders?.map((order) => ({
      id: order.id,
      purchase_order_no: order.purchase_order_no,
      order_date: dayjs(order.order_date).format("MMM D, YYYY"),
      status: order.status,
      expected_delivery_date: dayjs(order.expected_delivery_date).format(
        "MMM D, YYYY"
      ),
      usd_exchange_rate: order.usd_exchange_rate,
      currency_code: order.product_currency.currency_code,
      contact_person: order.contact_person.name,
      amount_local: order.purchase_order_items.reduce(
        (total: number, item: { quantity: number; unit_price_local: number }) =>
          total + item.quantity * item.unit_price_local,
        0
      ),
      amount_usd: order.purchase_order_items.reduce(
        (total: number, item: { quantity: number; unit_price_local: number }) =>
          total +
          (item.quantity * item.unit_price_local) / order.usd_exchange_rate,
        0
      ),
      supplier: order.supplier.name,
      invoiced_amount: 0,
      allocated_amount: 0,
      purchase_order_smart_status:
        order.purchase_order_smart_status?.status ?? "Error",
    }));

    const GetPurchaseOrderResponse: SupplierPurchaseOrderHistoryResponse = {
      dto: orders || [],
      total: count || 0,
      page,
      pageSize: pageSize ?? "",
    };

    return NextResponse.json(
      success(
        GetPurchaseOrderResponse,
        "Purchase order history retrieved successfully"
      ),
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
