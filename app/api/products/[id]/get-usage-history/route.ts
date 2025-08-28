import { getAuthenticatedUser } from "@/helper/getUser";
import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import {
  LastStockMovement,
  ProductPurchaseOrder,
  ProductUsageHistory,
} from "@/types/product/product.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<ProductUsageHistory | null>>> {
  const { id: idStr } = await context.params;
  const productId = parseInt(idStr);
  const searchParams = new URL(req.url).searchParams;
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "10");
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (!productId) {
    return NextResponse.json(error("Invalid product ID", 400), { status: 400 });
  }

  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  // 1. Get current stock
  const { data: stockInventoryRows, error: stockInventoryErr } = await supabase
    .from("inventory")
    .select("quantity")
    .eq("product_id", productId);

  const current_stock =
    stockInventoryRows?.reduce((sum, row) => sum + Number(row.quantity), 0) ??
    0;

  // 2. Fetch product min stock
  const { data: product, error: productError } = await supabase
    .from("product")
    .select("id, min_stock")
    .eq("id", productId)
    .single();

  if (productError || !product) {
    return NextResponse.json(error("Product not found", 404), { status: 404 });
  }

  // 3. Last stock movement
  const { data: stockTxRaw } = await supabase
    .from("stock_transaction")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let lastStockMovement: LastStockMovement | null = null;

  if (stockTxRaw) {
    const { data: invoiceItem } = await supabase
      .from("purchase_invoice_item")
      .select("purchase_invoice_id")
      .eq("id", stockTxRaw.invoice_line_item_id)
      .maybeSingle();

    const { data: invoice } = await supabase
      .from("purchase_invoice")
      .select("purchase_invoice_number")
      .eq("id", invoiceItem?.purchase_invoice_id)
      .maybeSingle();

    const { data: warehouse } = await supabase
      .from("warehouse")
      .select("name")
      .eq("id", stockTxRaw.warehouse_id)
      .maybeSingle();

    lastStockMovement = {
      date: stockTxRaw.created_at,
      type: stockTxRaw.type,
      quantity: stockTxRaw.quantity,
      invoice_id: invoice?.purchase_invoice_number ?? null,
      warehouse_name: warehouse?.name ?? "Unknown",
      processed_by: user?.user_metadata?.full_name ?? "Unknown",
    };
  }

  // 4. Purchase Order Items
  const { data: poItems, error: poItemError } = await supabase
    .from("purchase_order_items")
    .select("id, product_id, quantity, unit_price_local, purchase_order_id")
    .eq("product_id", productId);

  if (poItemError) {
    return NextResponse.json(error("Failed to fetch purchase orders", 500), {
      status: 500,
    });
  }

  const poIds = [...new Set(poItems.map((item) => item.purchase_order_id))];

  // 5. Purchase Orders
  const { data: purchaseOrders } = await supabase
    .from("purchase_order")
    .select(
      "id, purchase_order_no, order_date, status, usd_exchange_rate, currency_id, supplier_id"
    )
    .in("id", poIds);

  // 6. Supplier and Currency lookups
  const supplierIds = [...new Set(purchaseOrders?.map((po) => po.supplier_id))];
  const currencyIds = [...new Set(purchaseOrders?.map((po) => po.currency_id))];

  const { data: suppliers } = await supabase
    .from("supplier")
    .select("id, name")
    .in("id", supplierIds);

  const { data: currencies } = await supabase
    .from("product_currency")
    .select("id, currency_code")
    .in("id", currencyIds);

  const suppliersMap = new Map((suppliers ?? []).map((s) => [s.id, s.name]));
  const currencyMap = new Map(
    (currencies ?? []).map((c) => [c.id, c.currency_code])
  );

  // 7. Transform and paginate
  const allPurchaseOrders: ProductPurchaseOrder[] = poItems
    .map((item) => {
      const po = purchaseOrders?.find((p) => p.id === item.purchase_order_id);
      if (!po) return null;

      const quantity = item.quantity;
      const unitPrice = Number(item.unit_price_local);
      const amount = quantity * unitPrice;

      const currencyCode = currencyMap.get(po.currency_id) || "THB";
      const supplierName = suppliersMap.get(po.supplier_id) || "Unknown";

      return {
        purchase_order_no: po.purchase_order_no,
        supplier_name: supplierName,
        order_date: po.order_date,
        unit_price: `${unitPrice.toLocaleString()} ${currencyCode}`,
        amount: `${amount.toLocaleString()} ${currencyCode}`,
        amount_usd:
          po.usd_exchange_rate && amount
            ? `$${(amount / parseFloat(po.usd_exchange_rate)).toFixed(2)}`
            : "-",
        status: po.status,
        quantity,
      };
    })
    .filter(Boolean) as ProductPurchaseOrder[];

  const paginated = allPurchaseOrders.slice(from, to + 1);

  // 8. Final Response
  const usageHistory: ProductUsageHistory = {
    product_id: product.id,
    current_stock,
    minimum_stock: product.min_stock,
    last_stock_movement: lastStockMovement,
    purchase_orders: paginated,
    page,
    pageSize,
    total: allPurchaseOrders.length,
  };

  return NextResponse.json(success(usageHistory, "Usage history retrieved"), {
    status: 200,
  });
}
