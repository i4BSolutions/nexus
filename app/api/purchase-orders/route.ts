import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { PurchaseOrderInterface } from "@/types/purchase-order/purchase-order.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";
import { PurchaseOrderResponse } from "../../../types/purchase-order/purchase-order.type";

/**
 * This API route creates a purchase order.
 * @param req - NextRequest object
 * @returns NextResponse ApiResponse<PurchaseOrderInterface | null>
 */
export async function POST(
  req: NextRequest
): Promise<
  NextResponse<ApiResponse<PurchaseOrderInterface> | ApiResponse<null>>
> {
  const supabase = await createClient();
  const body = await req.json();

  const {
    po_number,
    supplier,
    region,
    budget,
    order_date,
    currency,
    exchange_rate,
    contact_person,
    sign_person,
    authorized_sign_person,
    expected_delivery_date,
    note,
    status,
    items = [],
  } = body;

  const orderData = {
    purchase_order_no: po_number,
    supplier_id: supplier,
    region_id: region,
    budget_id: Number(budget),
    order_date,
    currency_id: currency,
    usd_exchange_rate: Number(exchange_rate),
    contact_person_id: contact_person,
    sign_person_id: sign_person,
    authorized_signer_id: authorized_sign_person,
    expected_delivery_date,
    note: note ?? null,
    status: status ?? "Draft",
  };

  const { data: order, error: orderError } = await supabase
    .from("purchase_order")
    .insert(orderData)
    .select()
    .single();

  if (orderError) {
    return NextResponse.json(error(orderError.message), { status: 500 });
  }

  const itemsToInsert = (items || []).map((item: any) => ({
    purchase_order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price_local: item.unit_price_local,
  }));

  if (itemsToInsert.length > 0) {
    const { error: itemsError } = await supabase
      .from("purchase_order_items")
      .insert(itemsToInsert);

    if (itemsError) {
      return NextResponse.json(error(itemsError.message), { status: 500 });
    }
  }

  return NextResponse.json(
    success(order, "Purchase order and items created successfully"),
    { status: 200 }
  );
}

/**
 * This API route retrieves all purchase orders with optional filtering and sorting.
 * @param req - NextRequest object
 * @returns NextResponse ApiResponse<PurchaseOrderInterface[]>
 */
export async function GET(
  req: NextRequest
): Promise<
  NextResponse<ApiResponse<PurchaseOrderResponse> | ApiResponse<null>>
> {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const poNumber = searchParams.get("q") || "";
  const statusParam = searchParams.get("status");
  const sortParam = searchParams.get("sort");

  const page = parseInt(searchParams.get("page") || "1", 10);
  const hasPageSize = searchParams.has("pageSize");
  const pageSizeParam = searchParams.get("pageSize");
  const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : undefined;
  let from: number | undefined;
  let to: number | undefined;

  if (hasPageSize && pageSize !== undefined) {
    from = (page - 1) * pageSize;
    to = from + pageSize - 1;
  }

  let query = supabase.from("purchase_order").select(
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
      )
    `,
    { count: "exact" }
  );

  if (poNumber) {
    query = query.ilike("purchase_order_no", `%${poNumber}%`);
  }

  if (statusParam) {
    query = query.eq("status", statusParam);
  }

  query = query.order("id", {
    ascending: sortParam === "id_asc",
  });

  if (typeof from === "number" && typeof to === "number") {
    query = query.range(from, to);
  }

  const {
    data,
    count,
    error: getError,
  } = (await query) as unknown as {
    data: any[] | null;
    count: number | null;
    error: any;
  };

  if (getError) {
    return NextResponse.json(error(getError.message), { status: 500 });
  }

  const orders = data?.map((order) => ({
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
    invoiced_amount: 0,
    allocated_amount: 0,
  }));

  const GetPurchaseOrderResponse: PurchaseOrderResponse = {
    dto: orders || [],
    total: count || 0,
    page,
    pageSize: pageSize || "all",
    statistics: {
      total: count || 0,
      total_approved: orders
        ? orders.filter((order) => order.status === "Approved").length
        : 0,
      total_usd_value: orders
        ? orders.reduce((total, order) => total + order.amount_usd, 0)
        : 0,
      invoiced_percentage: 0,
      allocated_percentage: 0,
    },
  };

  return NextResponse.json(
    success<PurchaseOrderResponse>(
      GetPurchaseOrderResponse,
      "Purchase orders retrieved successfully"
    ),
    {
      status: 200,
    }
  );
}
