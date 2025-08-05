import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { success, error } from "@/lib/api-response";
import { InventoryResponse } from "@/types/inventory/inventory.type";
import { ApiResponse } from "@/types/shared/api-response-type";

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<InventoryResponse | any>>> {
  const supabase = await createClient();
  const { searchParams } = req.nextUrl;

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const search = searchParams.get("q")?.toLowerCase() || "";
  const warehouseFilter = searchParams.get("warehouse");

  // 1. Fetch inventory (filtered by warehouse if needed)
  let inventoryQuery = supabase.from("inventory").select(`
      id,
      quantity,
      warehouse:warehouse_id (
        name
      ),
      product:product_id (
        id,
        name,
        sku,
        category
      )
    `);

  if (warehouseFilter) {
    inventoryQuery = inventoryQuery.eq("warehouse_id", warehouseFilter);
  }

  const { data: rawInventory, error: inventoryError } = await inventoryQuery;

  if (inventoryError || !rawInventory) {
    return NextResponse.json(error("Failed to fetch inventory", 500), {
      status: 500,
    });
  }

  const inventory = rawInventory.map((inv: any) => ({
    id: inv.id,
    quantity: inv.quantity,
    warehouse: inv.warehouse?.name || "Unknown",
    product: Array.isArray(inv.product) ? inv.product[0] : inv.product,
  }));

  const productIds = [...new Set(inventory.map((inv) => inv.product.id))];

  // 2. Fetch invoice items for WAC calculation
  const { data: invoiceItems } = await supabase
    .from("purchase_invoice_item")
    .select("product_id, unit_price_local, quantity")
    .in("product_id", productIds);

  const totalCostMap: Record<number, number> = {};
  const totalQtyMap: Record<number, number> = {};
  const wacMap: Record<number, number> = {};

  for (const item of invoiceItems || []) {
    const pid = item.product_id;
    totalCostMap[pid] =
      (totalCostMap[pid] || 0) + item.unit_price_local * item.quantity;
    totalQtyMap[pid] = (totalQtyMap[pid] || 0) + item.quantity;
  }

  for (const pid in totalCostMap) {
    const qty = totalQtyMap[pid];
    wacMap[+pid] = qty > 0 ? totalCostMap[pid] / qty : 0;
  }

  // 3. Build item list with WAC
  const itemDetails = inventory.map((inv) => {
    const unitPrice = wacMap[inv.product.id] || 0;
    return {
      id: inv.id,
      sku: inv.product.sku,
      name: inv.product.name,
      warehouse: inv.warehouse,
      current_stock: inv.quantity,
      unit_price: unitPrice,
      total_value: unitPrice * inv.quantity,
    };
  });

  // 4. Filter & paginate
  let filtered = itemDetails;
  if (search) {
    filtered = filtered.filter((item) =>
      `${item.name} ${item.sku} ${item.warehouse}`
        .toLowerCase()
        .includes(search)
    );
  }

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const totalInventoryValue = filtered.reduce(
    (sum, i) => sum + i.total_value,
    0
  );
  const totalItemCount = filtered.reduce((sum, i) => sum + i.current_stock, 0);

  return NextResponse.json(
    success(
      {
        items: paged,
        total_item_count: totalItemCount,
        total_inventory_value: totalInventoryValue,
        total: inventory.length,
        page,
        pageSize,
      },
      "Inventory fetched successfully"
    ),
    { status: 200 }
  );
}
