import { success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import {
  DynamicPricingItems,
  ProductCurrencyInterface,
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

  // Detect "no filter" state
  const hasAnyFilter = Boolean(
    filters?.currency ||
      filters?.region ||
      filters?.regionId ||
      filters?.contactPerson ||
      filters?.contactPersonId
  );

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
  const poJoinNeedsInner = hasAnyFilter;

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
    (item: any) => {
      const qty =
        (typeof item.quantity === "number" ? item.quantity : undefined) ??
        (typeof item.item_quantity === "number"
          ? item.item_quantity
          : undefined) ??
        0;

      const exchange_rate = item.purchase_order?.usd_exchange_rate ?? 0;
      const unit_price_local = item.unit_price_local ?? 0;

      // Per-unit USD (e.g., 60,000 MMK / 4,500 MMK per USD = 13.33 USD per unit if qty=1)
      const unit_price_usd =
        exchange_rate > 0 ? unit_price_local / exchange_rate : 0;

      return {
        purchase_order_number: item.purchase_order?.purchase_order_no,
        order_date: item.purchase_order?.order_date,
        region: item.purchase_order?.purchase_order_region?.name,
        contact_person: item.purchase_order?.person?.name,
        currency_code: item.purchase_order?.product_currency?.currency_code,
        unit_price_local,
        exchange_rate,
        unit_price_usd,
        quantity: qty,
      } as DynamicPricingItems;
    }
  );

  // Keep only rows with enough info to compute USD
  const validItems = mappedResponse.filter(
    (it: any) =>
      (it?.exchange_rate ?? 0) > 0 &&
      (it?.unit_price_local ?? 0) > 0 &&
      (it?.unit_price_usd ?? 0) > 0 &&
      (it?.quantity ?? 0) > 0
  );

  // Pagination (in-memory)
  const total = validItems.length;
  const pagedItems = validItems.slice((page - 1) * pageSize, page * pageSize);

  // === Statistics ===
  const perUnitUSD = validItems.map((it: any) => it.unit_price_usd);
  const max_price_usd = perUnitUSD.length ? Math.max(...perUnitUSD) : 0;
  const min_price_usd = perUnitUSD.length ? Math.min(...perUnitUSD) : 0;
  const maxIdx = perUnitUSD.indexOf(max_price_usd);
  const minIdx = perUnitUSD.indexOf(min_price_usd);

  const max_price_local =
    maxIdx >= 0
      ? `${Number(validItems[maxIdx]?.unit_price_local).toLocaleString(
          undefined,
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )} ${validItems[maxIdx]?.currency_code}`
      : "";
  const min_price_local =
    minIdx >= 0
      ? `${Number(validItems[minIdx]?.unit_price_local).toLocaleString(
          undefined,
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )} ${validItems[minIdx]?.currency_code}`
      : "";
  const max_purchase_order_number =
    maxIdx >= 0 ? validItems[maxIdx]?.purchase_order_number : "";
  const min_purchase_order_number =
    minIdx >= 0 ? validItems[minIdx]?.purchase_order_number : "";

  // Weighted average (quantity-weighted)
  const total_purchase_order_usd = validItems.reduce(
    (sum: number, it: any) => sum + it.unit_price_usd * it.quantity,
    0
  );
  const total_quantity = validItems.reduce(
    (sum: number, it: any) => sum + it.quantity,
    0
  );
  const average_price_usd =
    total_quantity > 0 ? total_purchase_order_usd / total_quantity : 0;

  // ✅ Only update product price when there are NO filters
  if (!hasAnyFilter && total_quantity > 0) {
    await updateProductPrice(average_price_usd, Number(productId));
  }

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

async function updateProductPrice(
  average_price_usd: number,
  productId: number
) {
  const supabase = await createClient();

  const { data: currencyDataRaw } = await supabase
    .from("product_currency")
    .select("*")
    .eq("currency_code", "USD")
    .single();

  const currencyData = currencyDataRaw as ProductCurrencyInterface;

  // Get old unit price from products table
  const { data: oldProduct, error: oldProductError } = await supabase
    .from("product")
    .select("unit_price")
    .eq("id", productId)
    .single();

  if (oldProductError) {
    throw new Error("Failed to fetch existing product data");
  }

  if (oldProduct?.unit_price == average_price_usd) {
    return;
  }

  // Update the product's unit price
  const { error: updateProductError } = await supabase
    .from("product")
    .update({
      currency_code_id: currencyData?.id,
      unit_price: average_price_usd,
    })
    .eq("id", productId);

  if (updateProductError) {
    throw new Error("Failed to update product price");
  }

  // Insert audit log for the product price update
  const auditLog = {
    product_id: productId,
    changed_field: "unit_price",
    old_values: oldProduct?.unit_price ?? null,
    new_values: average_price_usd,
    is_system: true,
  };
  const { error: auditError } = await supabase
    .from("product_audit_log")
    .insert([auditLog]);

  if (auditError) {
    throw new Error("Failed to log audit entry: " + auditError.message);
  }
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
