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
  invoice_number: string | null;
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

  // 1. Warehouse basic info
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

  // 2. Current inventory for this warehouse
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

  if (inventoryError) {
    return NextResponse.json(error("Failed to fetch inventory", 500), {
      status: 500,
    });
  }

  const inventory: InventoryWithProduct[] = (rawInventory || []).map(
    (inv: any) => ({
      id: inv.id,
      quantity: inv.quantity,
      product: Array.isArray(inv.product) ? inv.product[0] : inv.product,
    })
  );

  // If no inventory lines, skip the rest of heavy loading
  if (!inventory || inventory.length === 0) {
    return NextResponse.json(
      success(
        {
          warehouse: {
            id: warehouse.id,
            name: warehouse.name,
            location: warehouse.location,
            capacity: warehouse.capacity,
          },
          currency: "USD",
          total_item_count: 0,
          total_stock_value: 0,
          stock_in: 0,
          stock_out: 0,
          inventory: tab === "inventory" ? [] : [],
          stock_movement_logs: tab === "stock_movements" ? [] : [],
          inventory_total: 0,
          stock_movement_total: 0,
        },
        "Warehouse details fetched successfully"
      ),
      { status: 200 }
    );
  }

  // 3. Build WAC **in USD** per product (rate-aware, no N+1)
  const productIds = inventory.map((inv) => inv.product.id);

  // Need purchase invoice exchange rate alongside each line item
  const { data: invoiceItems, error: priceError } = await supabase
    .from("purchase_invoice_item")
    .select(
      `
      product_id,
      unit_price_local,
      quantity,
      purchase_invoice:purchase_invoice_id (
        exchange_rate_to_usd
      )
    `
    )
    .in("product_id", productIds);

  if (priceError) {
    return NextResponse.json(error("Failed to fetch unit prices", 500), {
      status: 500,
    });
  }

  // Compute WAC_USD(product)
  const totalCostUsdMap: Record<number, number> = {};
  const totalQtyMap: Record<number, number> = {};

  for (const line of invoiceItems || []) {
    const productId = line.product_id as number;
    const unitPriceLocal = Number(line.unit_price_local);
    const qty = Number(line.quantity);
    const exrate = Number((line as any).purchase_invoice?.exchange_rate_to_usd);

    if (unitPriceLocal === 0 || qty <= 0) continue; // skip FOC or non-positive

    // Convert to USD using the invoice's exchange rate
    // USD = local / exchange_rate_to_usd (per your formula)
    const unitPriceUsd = unitPriceLocal / exrate;

    totalCostUsdMap[productId] =
      (totalCostUsdMap[productId] || 0) + unitPriceUsd * qty;
    totalQtyMap[productId] = (totalQtyMap[productId] || 0) + qty;
  }

  const wacUsdMap: Record<number, number> = {};
  for (const pid of Object.keys(totalCostUsdMap)) {
    const nPid = Number(pid);
    const tQty = totalQtyMap[nPid] || 0;
    wacUsdMap[nPid] = tQty > 0 ? totalCostUsdMap[nPid] / tQty : 0;
  }

  // 4. IN/OUT totals per product (for extra columns)
  const { data: transactionSums, error: txError } = await supabase
    .from("stock_transaction")
    .select("product_id, type, quantity")
    .eq("warehouse_id", id);

  if (txError) {
    return NextResponse.json(error("Failed to fetch stock transactions", 500), {
      status: 500,
    });
  }

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

  // Build row items using WAC_USD
  const inventoryDetails = inventory.map((inv) => {
    const unit_price_wac_usd = wacUsdMap[inv.product.id] || 0;
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
      unit_price_wac_usd: Number(unit_price_wac_usd.toFixed(4)),
      total_value: Number((unit_price_wac_usd * inv.quantity).toFixed(2)), // USD
    };
  });

  const totalStockValue = inventoryDetails.reduce(
    (acc, item) => acc + item.total_value,
    0
  );

  // Search + paginate inventory rows
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

  // 5. Stock movements summary (IN / OUT)
  const { data: stockMovements, error: sumErr } = await supabase
    .from("stock_transaction")
    .select("type, quantity")
    .eq("warehouse_id", id);

  if (sumErr) {
    return NextResponse.json(
      error("Failed to fetch stock movement summary", 500),
      {
        status: 500,
      }
    );
  }

  const totalIn =
    stockMovements
      ?.filter((tx) => tx.type === "IN")
      .reduce((sum, tx) => sum + tx.quantity, 0) || 0;
  const totalOut =
    stockMovements
      ?.filter((tx) => tx.type === "OUT")
      .reduce((sum, tx) => sum + tx.quantity, 0) || 0;

  // 6. Recent stock movement logs (with invoice number)
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

  if (movementError) {
    return NextResponse.json(
      error("Failed to fetch stock movement logs", 500),
      {
        status: 500,
      }
    );
  }

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
        currency: "USD",
        total_item_count: totalItemCount,
        total_stock_value: Number(totalStockValue.toFixed(2)),
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
