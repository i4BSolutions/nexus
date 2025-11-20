import { success, error } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/shared/api-response-type";
import {
  WarehouseInterface,
  WarehouseResponse,
} from "@/types/warehouse/warehouse.type";
import { NextRequest, NextResponse } from "next/server";

/**
 * This API route retrieves all warehouses from the database with
 * pagination support
 * descending order by default
 * sorting by name/ capacity/ total items/ total value
 *
 * Total Amount = Sum of (Current Stock × WAC_USD per SKU)
 * WAC_USD(product) = Σ((unit_price_local / exchange_rate_to_usd) × qty) / Σ(qty)  (skips FOC lines)
 */
export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<WarehouseResponse> | ApiResponse<null>>> {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.max(
    1,
    parseInt(searchParams.get("pageSize") || "10", 10)
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const search = (searchParams.get("q") || "").trim();
  const sortBy = (searchParams.get("sortBy") || "name") as
    | "name"
    | "capacity"
    | "total_items"
    | "total_amount";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

  // 1) Base warehouse list (paged) + count
  let whQuery = supabase.from("warehouse").select("*", { count: "exact" });

  if (search) {
    whQuery = whQuery.or(`name.ilike.%${search}%`);
  }

  whQuery = whQuery.range(from, to);

  const { data: warehouses, error: whError, count } = await whQuery;

  if (whError) {
    return NextResponse.json(error("Failed to fetch warehouses", 500), {
      status: 500,
    });
  }

  // 2) Fetch current inventory (product_id, warehouse_id, quantity)
  const { data: inventoryData, error: inventoryError } = await supabase
    .from("inventory")
    .select("product_id, warehouse_id, quantity");

  if (inventoryError) {
    return NextResponse.json(error("Failed to fetch inventory", 500), {
      status: 500,
    });
  }

  // 3) Fetch all purchase items + their invoice exchange rates in ONE query
  const { data: priceData, error: priceError } = await supabase
    .from("purchase_invoice_item")
    .select(
      "product_id, unit_price_local, quantity, purchase_invoice(exchange_rate_to_usd)"
    );

  if (priceError) {
    return NextResponse.json(error("Failed to fetch unit prices", 500), {
      status: 500,
    });
  }

  // 4) Compute WAC **in USD** per product
  // Skip FOC lines (unit_price_local === 0)
  const totalCostUsdMap: Record<number, number> = {};
  const totalQtyMap: Record<number, number> = {};

  for (const line of priceData || []) {
    const productId = line.product_id as number;
    const unitPriceLocal = Number(line.unit_price_local);
    const qty = Number(line.quantity);
    const exrate = Number((line as any).purchase_invoice?.exchange_rate_to_usd);

    if (unitPriceLocal === 0 || qty <= 0) continue; // exclude FOC and non-positive qty

    const unitPriceUsd = unitPriceLocal / exrate;

    totalCostUsdMap[productId] =
      (totalCostUsdMap[productId] || 0) + unitPriceUsd * qty;
    totalQtyMap[productId] = (totalQtyMap[productId] || 0) + qty;
  }

  const wacUsdMap: Record<number, number> = {};
  for (const pidStr of Object.keys(totalCostUsdMap)) {
    const pid = Number(pidStr);
    const totalQty = totalQtyMap[pid] || 0;
    wacUsdMap[pid] = totalQty > 0 ? totalCostUsdMap[pid] / totalQty : 0;
  }

  // 5) Aggregate totals per warehouse using WAC_USD
  type Totals = Record<number, { total_items: number; total_amount: number }>;
  const warehouseTotals: Totals = {};

  for (const row of inventoryData || []) {
    const productId = row.product_id as number;
    const warehouseId = row.warehouse_id as number;
    const qty = Number(row.quantity) || 0;
    const wacUsd = wacUsdMap[productId] || 0;

    if (!warehouseTotals[warehouseId]) {
      warehouseTotals[warehouseId] = { total_items: 0, total_amount: 0 };
    }
    warehouseTotals[warehouseId].total_items += qty;
    warehouseTotals[warehouseId].total_amount += qty * wacUsd;
  }

  // 6) Combine into response records
  let mappedData: WarehouseInterface[] = (warehouses || []).map((w) => {
    const totals = warehouseTotals[w.id] || {
      total_items: 0,
      total_amount: 0,
    };

    return {
      ...w,
      total_items: totals.total_items,
      total_amount: Number(totals.total_amount.toFixed(2)),
    };
  });

  // 7) Sorting for derived fields (total_items / total_amount)
  mappedData = mappedData.sort((a: any, b: any) => {
    const dir = sortOrder === "asc" ? 1 : -1;
    const av = a[sortBy] ?? 0;
    const bv = b[sortBy] ?? 0;

    if (typeof av === "string" && typeof bv === "string") {
      return av.localeCompare(bv) * dir;
    }
    return (av - bv) * dir;
  });

  const response: WarehouseResponse = {
    items: mappedData,
    total: count || 0,
    page,
    pageSize,
  };

  return NextResponse.json(
    success(response, "Warehouses fetched successfully"),
    { status: 200 }
  );
}

/**
 * This API route creates a new warehouse in the database.
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<WarehouseResponse> | ApiResponse<null>>> {
  const supabase = await createClient();

  try {
    const body = await req.json();

    const { name, location, capacity } = body;

    if (!name || !location) {
      return NextResponse.json(error("Name, and location are required", 400), {
        status: 400,
      });
    }

    const { data, error: dbError } = await supabase
      .from("warehouse")
      .insert([
        {
          name,
          location,
          capacity,
        },
      ])
      .select()
      .single();
    if (dbError) {
      return NextResponse.json(
        error("Failed to create warehouse: " + dbError?.message, 500),
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(success(data, "Warehouse created successfully"), {
      status: 201,
    });
  } catch (e) {
    return NextResponse.json(error("Invalid request body", 400), {
      status: 400,
    });
  }
}
