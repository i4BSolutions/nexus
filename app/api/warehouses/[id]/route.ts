import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/shared/api-response-type";
import { WarehouseInterface } from "@/types/warehouse/warehouse.type";
import { NextRequest, NextResponse } from "next/server";

type InventoryWithProduct = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    sku: string;
    category: string;
  };
};

type StockTransaction = {
  id: number;
  created_at: string;
  quantity: number;
  type: "IN" | "OUT";
  invoice_line_item_id: number | null;
  product: {
    name: string;
    sku: string;
  };
  reason: string;
  invoice_number: string;
};

// Helper function to format date/time
function formatDateTime(timestamp: string) {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US"),
  };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<any>>> {
  const supabase = await createClient();
  const { id } = await context.params;

  const { searchParams } = req.nextUrl;
  const tab = searchParams.get("tab") || "inventory";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const search = searchParams.get("search")?.toLowerCase() || "";

  // 1. Fetch warehouse basic info
  const { data: warehouse, error: warehouseError } = await supabase
    .from("warehouse")
    .select("*")
    .eq("id", id)
    .single();

  if (warehouseError || !warehouse) {
    return NextResponse.json(error("Warehouse not found", 404), {
      status: 404,
    });
  }

  // 2. Fetch current inventory in this warehouse
  const { data: rawInventory, error: inventoryError } = await supabase
    .from("inventory")
    .select(
      `
      id,
      quantity,
      product:product_id (
        id,
        name,
        sku,
        category
      ),
      warehouse_id
    `
    )
    .eq("warehouse_id", id);

  const inventory: InventoryWithProduct[] = (rawInventory || []).map(
    (inv: any) => ({
      id: inv.id,
      quantity: inv.quantity,
      product: Array.isArray(inv.product) ? inv.product[0] : inv.product,
    })
  );

  if (inventoryError) {
    return NextResponse.json(error("Failed to fetch inventory", 500), {
      status: 500,
    });
  }

  // 3. Fetch unit prices from invoice line items to calculate total value
  const productIds = inventory.map((inv) => inv.product.id);
  const { data: invoiceItems } = await supabase
    .from("purchase_invoice_item")
    .select("product_id, unit_price_local, quantity")
    .in("product_id", productIds);

  const totalCostMap: Record<number, number> = {};
  const totalQtyMap: Record<number, number> = {};
  const wacMap: Record<number, number> = {};

  for (const item of invoiceItems || []) {
    const productId = item.product_id;
    const unitPrice = item.unit_price_local;
    const qty = item.quantity;
    // Exclude FOC items (unit price is 0)
    if (unitPrice === 0) continue;

    totalCostMap[productId] = (totalCostMap[productId] || 0) + unitPrice * qty;
    totalQtyMap[productId] = (totalQtyMap[productId] || 0) + qty;
  }

  for (const productId in totalCostMap) {
    const totalQty = totalQtyMap[productId];
    wacMap[+productId] = totalQty > 0 ? totalCostMap[productId] / totalQty : 0;
  }

  // Fetch incoming and outgoing stock per product in this warehouse
  const { data: transactionSums, error: txError } = await supabase
    .from("stock_transaction")
    .select("product_id, type, quantity")
    .eq("warehouse_id", id);

  const incomingMap: Record<number, number> = {};
  const outgoingMap: Record<number, number> = {};

  (transactionSums || []).forEach((tx) => {
    if (tx.type === "IN") {
      incomingMap[tx.product_id] =
        (incomingMap[tx.product_id] || 0) + tx.quantity;
    } else if (tx.type === "OUT") {
      outgoingMap[tx.product_id] =
        (outgoingMap[tx.product_id] || 0) + tx.quantity;
    }
  });

  const inventoryDetails = inventory.map((inv) => {
    const unitPrice = wacMap[inv.product.id] || 0;
    const incoming = incomingMap[inv.product.id] || 0;
    const outgoing = outgoingMap[inv.product.id] || 0;

    return {
      id: inv.id,
      sku: inv.product.sku,
      name: inv.product.name,
      category: inv.product.category,
      current_stock: inv.quantity,
      incoming,
      outgoing,
      total_value: unitPrice * inv.quantity,
    };
  });

  const totalStockValue = inventoryDetails.reduce(
    (acc, item) => acc + item.total_value,
    0
  );

  let inventoryDetailsFiltered = inventoryDetails;

  if (search) {
    inventoryDetailsFiltered = inventoryDetailsFiltered.filter((item) =>
      `${item.name} ${item.sku} ${item.category}`.toLowerCase().includes(search)
    );
  }

  const inventoryPage = inventoryDetailsFiltered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // 4. Fetch stock movements (IN/OUT summary)
  const { data: stockMovements } = await supabase
    .from("stock_transaction")
    .select("type, quantity")
    .eq("warehouse_id", id);

  const totalIn =
    stockMovements
      ?.filter((tx) => tx.type === "IN")
      .reduce((sum, tx) => sum + tx.quantity, 0) || 0;
  const totalOut =
    stockMovements
      ?.filter((tx) => tx.type === "OUT")
      .reduce((sum, tx) => sum + tx.quantity, 0) || 0;

  // 5. Fetch recent stock movement log
  const { data: rawMovements, error: movementError } = await supabase
    .from("stock_transaction")
    .select(
      `
      id,
      created_at,
      quantity,
      type,
      invoice_line_item_id,
      product:product_id (
        name,
        sku
      ),
      reason,
      purchase_invoice_item:invoice_line_item_id (
        purchase_invoice (
          purchase_invoice_number
        )
      )
    `
    )
    .eq("warehouse_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  const movements: StockTransaction[] = (rawMovements || []).map((m: any) => ({
    id: m.id,
    created_at: m.created_at,
    quantity: m.quantity,
    type: m.type,
    invoice_line_item_id: m.invoice_line_item_id,
    product: Array.isArray(m.product) ? m.product[0] : m.product,
    reason: m.reason || "",
    invoice_number:
      m.purchase_invoice_item?.purchase_invoice?.purchase_invoice_number ||
      null,
  }));

  const stockMovementLogs = movements.map((m) => {
    const { date, time } = formatDateTime(m.created_at);
    return {
      id: m.id,
      date,
      time,
      sku: m.product?.sku,
      name: m.product?.name,
      direction: m.type === "IN" ? "Stock In" : "Stock Out",
      quantity: m.quantity,
      reference: m.invoice_number ? m.invoice_number : m.reason,
    };
  });

  let stockMovementLogsFiltered = stockMovementLogs;

  if (search) {
    stockMovementLogsFiltered = stockMovementLogsFiltered.filter((m) =>
      `${m.name} ${m.sku}`.toLowerCase().includes(search)
    );
  }

  const movementPage = stockMovementLogsFiltered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const totalItemCount = inventory.reduce((acc, inv) => acc + inv.quantity, 0);

  // Final response
  return NextResponse.json(
    success(
      {
        warehouse: {
          id: warehouse.id,
          name: warehouse.name,
          location: warehouse.location,
          capacity: warehouse.capacity,
        },
        total_item_count: totalItemCount,
        total_stock_value: totalStockValue,
        stock_in: totalIn,
        stock_out: totalOut,
        inventory: tab === "inventory" ? inventoryPage : [],
        stock_movement_logs: tab === "stock_movements" ? movementPage : [],
        inventory_total: inventoryDetailsFiltered.length,
        stock_movement_total: stockMovementLogsFiltered.length,
      },
      "Warehouse details fetched successfully"
    ),
    { status: 200 }
  );
}

/**
 * This API route retrieves a warehouse by ID and updates it if necessary.
 * @param req - NextRequest object
 * @param context - Context object
 * @returns NextResponse ApiResponse<WarehouseInterface | null>
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<WarehouseInterface | null>>> {
  const supabase = await createClient();
  const { id: idStr } = await context.params;

  const body = await req.json();

  try {
    const { data, error: dbError } = await supabase
      .from("warehouse")
      .update(body)
      .eq("id", idStr)
      .select()
      .single();

    return NextResponse.json(success(data, "Warehouse updated successfully"), {
      status: 201,
    });
  } catch (e: any) {
    return NextResponse.json(error(e.message, 500), {
      status: 500,
    });
  }
}
