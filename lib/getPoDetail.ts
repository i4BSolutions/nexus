import { createClient } from "@/lib/supabase/server";
import type { PurchaseOrderDetailDto } from "@/types/purchase-order/purchase-order-detail.type";

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
    "purchase_order_smart_status (status)",
  ];
  return await supabase
    .from("purchase_order")
    .select(selectFields.join(","))
    .eq("id", idStr)
    .single();
}

async function fetchPurchaseOrderItems(supabase: any, idStr: string) {
  return await supabase
    .from("purchase_order_items")
    .select("*, product:product_id(id, name, sku, description)")
    .eq("purchase_order_id", idStr);
}

async function fetchPurchaseInvoiceItemsByPoId(
  supabase: any,
  purchaseOrderId: string
) {
  return await supabase
    .from("purchase_invoice_item")
    .select("product_id, quantity, purchase_invoice!inner(is_voided)")
    .eq("purchase_order_id", purchaseOrderId)
    .eq("purchase_invoice.is_voided", false);
}

function calculateTotals(items: any[], usdExchangeRate: number) {
  const totalAmountLocal =
    items?.reduce(
      (sum, it) => sum + (it.quantity ?? 0) * (it.unit_price_local ?? 0),
      0
    ) ?? 0;
  const totalAmountUSD = usdExchangeRate
    ? totalAmountLocal / usdExchangeRate
    : 0;
  return { totalAmountLocal, totalAmountUSD };
}

function formatPurchaseOrderItems(
  items: any[] = [],
  usdExchangeRate: number,
  invoiceQuantityMap: Record<string, number> = {}
) {
  return items.map((item) => {
    const orderedQty = item.quantity ?? 0;
    const invoicedQty = invoiceQuantityMap[item.product_id] ?? 0;
    const availableQty = orderedQty - invoicedQty;
    return {
      id: item.id,
      product: item.product?.id,
      product_name: item.product?.name,
      quantity: orderedQty,
      unit_price_local: item.unit_price_local,
      unit_price_usd: usdExchangeRate
        ? item.unit_price_local / usdExchangeRate
        : 0,
      sub_total_local: orderedQty * item.unit_price_local,
      sub_total_usd: usdExchangeRate
        ? (orderedQty * item.unit_price_local) / usdExchangeRate
        : 0,
      ordered: orderedQty,
      invoiced: invoicedQty,
      available: availableQty,
    };
  });
}

function buildPurchaseOrderDetailDto(
  purchaseOrder: any,
  formattedItems: any[],
  totalAmountLocal: number,
  totalAmountUSD: number
): PurchaseOrderDetailDto {
  return {
    id: purchaseOrder.id,
    status: purchaseOrder.status,
    purchase_order_no: purchaseOrder.purchase_order_no,
    supplier: {
      id: purchaseOrder.supplier?.id ?? 0,
      name: purchaseOrder.supplier?.name ?? "Unknown Supplier",
    },
    region: {
      id: purchaseOrder.region?.id ?? 0,
      name: purchaseOrder.region?.name ?? "Unknown Region",
    },
    order_date: purchaseOrder.order_date,
    expected_delivery_date: purchaseOrder.expected_delivery_date,
    budget: {
      id: purchaseOrder.budget?.id ?? 0,
      name: purchaseOrder.budget?.budget_name ?? "Unknown Budget",
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
          id: purchaseOrder.sign_person.id,
          name: purchaseOrder.sign_person.name,
        }
      : null,
    authorized_sign_person: purchaseOrder.authorized_signer
      ? {
          id: purchaseOrder.authorized_signer.id,
          name: purchaseOrder.authorized_signer.name,
        }
      : null,
    note: purchaseOrder.note,
    purchase_order_smart_status:
      purchaseOrder.purchase_order_smart_status?.status ?? "Unknown Status",
  };
}

export async function getPoDetail(
  idStr: string
): Promise<PurchaseOrderDetailDto> {
  const supabase = await createClient();

  const { data: purchaseOrder, error: poError } =
    await fetchPurchaseOrderWithJoins(supabase, idStr);
  if (poError) throw new Error(poError.message);
  if (!purchaseOrder) throw new Error("Purchase order not found");

  const [
    { data: items, error: itemsError },
    { data: allPIItems, error: piError },
  ] = await Promise.all([
    fetchPurchaseOrderItems(supabase, idStr),
    fetchPurchaseInvoiceItemsByPoId(supabase, idStr),
  ]);

  if (itemsError) throw new Error(itemsError.message);
  if (piError) throw new Error(piError.message);

  const invoiceQuantityMap: Record<string, number> = {};
  allPIItems?.forEach((it: any) => {
    const pid = String(it.product_id);
    invoiceQuantityMap[pid] =
      (invoiceQuantityMap[pid] ?? 0) + (it.quantity ?? 0);
  });

  const { totalAmountLocal, totalAmountUSD } = calculateTotals(
    items ?? [],
    purchaseOrder.usd_exchange_rate
  );
  const formattedItems = formatPurchaseOrderItems(
    items ?? [],
    purchaseOrder.usd_exchange_rate,
    invoiceQuantityMap
  );

  return buildPurchaseOrderDetailDto(
    purchaseOrder,
    formattedItems,
    totalAmountLocal,
    totalAmountUSD
  );
}
