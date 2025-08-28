import { success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import {
  DynamicPricingItems,
  ProductDynamicPricing,
} from "@/types/product/product.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";

type Filters = {
  currency?: string;
  region?: string;
  regionId?: string | number;
  contactPerson?: string;
  contactPersonId?: string | number;
};

async function fetchProductDynamicPricingData(
  productId: string,
  page = 1,
  pageSize = 10,
  filters: Filters = {}
): Promise<ProductDynamicPricing> {
  const supabase = await createClient();

  // Build the select with conditional !inner joins so filters actually constrain rows
  const currencyJoin = filters?.currency
    ? "product_currency:currency_id!inner(*)"
    : "product_currency:currency_id(*)";

  const regionJoin = filters?.regionId
    ? "purchase_order_region:region_id!inner(*)"
    : "purchase_order_region:region_id(*)";

  const personJoin = filters?.contactPersonId
    ? "person:contact_person_id!inner(*)"
    : "person:contact_person_id(*)";

  // Make purchase_order itself inner whenever *any* PO-level filter exists
  const poJoinNeedsInner = !!(
    filters?.currency ||
    filters?.region ||
    filters?.regionId ||
    filters?.contactPerson ||
    filters?.contactPersonId
  );

  const purchaseOrderJoin = poJoinNeedsInner
    ? `purchase_order:purchase_order_id!inner(*, ${regionJoin}, ${personJoin}, ${currencyJoin})`
    : `purchase_order:purchase_order_id(*, ${regionJoin}, ${personJoin}, ${currencyJoin})`;

  let query = supabase
    .from("purchase_order_items")
    .select(`*, ${purchaseOrderJoin}`, { count: "exact" })
    .eq("product_id", Number(productId));

  // === Filters ===
  if (filters?.currency) {
    query = query.eq(
      "purchase_order.product_currency.currency_code",
      filters.currency
    );
  }

  if (filters?.regionId) {
    query = query.eq("purchase_order.region_id", Number(filters.regionId));
  } else if (filters?.region) {
    query = query.eq(
      "purchase_order.purchase_order_region.name",
      filters.region
    );
  }

  if (filters?.contactPersonId) {
    query = query.eq(
      "purchase_order.contact_person_id",
      Number(filters.contactPersonId)
    );
  } else if (filters?.contactPerson) {
    query = query.eq("purchase_order.person.name", filters.contactPerson);
  }

  const { data: orderItems, error } = await query;
  if (error) throw new Error(error.message);

  const mappedResponse: DynamicPricingItems[] = (orderItems ?? []).map(
    (item: any) => ({
      purchase_order_number: item.purchase_order?.purchase_order_no,
      order_date: item.purchase_order?.order_date,
      region: item.purchase_order?.purchase_order_region?.name,
      contact_person: item.purchase_order?.person?.name,
      currency_code: item.purchase_order?.product_currency?.currency_code,
      unit_price_local: item.unit_price_local,
      exchange_rate: item.purchase_order?.usd_exchange_rate,
      unit_price_usd:
        (item.unit_price_local ?? 0) *
        (item.purchase_order?.usd_exchange_rate ?? 0),
    })
  );

  // Filter out rows with nulls
  const validItems = mappedResponse.filter(
    (item) => item.exchange_rate && item.unit_price_local && item.unit_price_usd
  );

  // Pagination in-memory; if dataset is large, switch to range() at the DB level
  const total = validItems.length;
  const pagedItems = validItems.slice((page - 1) * pageSize, page * pageSize);

  // Statistics
  const unitPrices = validItems.map((item) => item.unit_price_usd);
  const average_price_usd = unitPrices.length
    ? unitPrices.reduce((a, b) => a + b, 0) / unitPrices.length
    : 0;
  const max_price_usd = unitPrices.length ? Math.max(...unitPrices) : 0;
  const min_price_usd = unitPrices.length ? Math.min(...unitPrices) : 0;
  const maxIdx = unitPrices.indexOf(max_price_usd);
  const minIdx = unitPrices.indexOf(min_price_usd);

  const max_price_local =
    maxIdx >= 0
      ? `${validItems[maxIdx]?.unit_price_local} ${validItems[maxIdx]?.currency_code}`
      : "";
  const min_price_local =
    minIdx >= 0
      ? `${validItems[minIdx]?.unit_price_local} ${validItems[minIdx]?.currency_code}`
      : "";
  const max_purchase_order_number =
    maxIdx >= 0 ? validItems[maxIdx]?.purchase_order_number : "";
  const min_purchase_order_number =
    minIdx >= 0 ? validItems[minIdx]?.purchase_order_number : "";

  return {
    items: pagedItems,
    statistics: {
      average_price_usd,
      max_price_usd,
      max_price_local,
      max_purchase_order_number,
      min_price_usd,
      min_price_local,
      min_purchase_order_number,
    },
    pagination: {
      total,
      page,
      pageSize,
    },
  };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<ProductDynamicPricing> | any>> {
  const { id } = await context.params;
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  const currency = searchParams.get("currency") ?? undefined;

  const regionId = searchParams.get("regionId") ?? undefined;

  const contactPersonId = searchParams.get("contactPersonId") ?? undefined;

  const productDynamicPricing = await fetchProductDynamicPricingData(
    id,
    page,
    pageSize,
    {
      currency,
      regionId,
      contactPersonId,
    }
  );

  return NextResponse.json(
    success(productDynamicPricing, "Dynamic pricing retrieved successfully"),
    { status: 200 }
  );
}
