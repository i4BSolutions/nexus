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
 */
export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<WarehouseResponse> | ApiResponse<null>>> {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const search = searchParams.get("q") || "";

  let query = supabase.from("warehouse").select("*", { count: "exact" });

  // Search functionality
  if (search) {
    query = query.or(`name.ilike.%${search}%`);
  }

  query = query.range(from, to);

  const { data, error: dbError, count } = await query;

  if (dbError) {
    return NextResponse.json(error("Failed to fetch warehouses", 500), {
      status: 500,
    });
  }

  const { data: inventoryData, error: inventoryError } = await supabase
    .from("inventory")
    .select("product_id, warehouse_id, quantity");

  if (inventoryError) {
    return NextResponse.json(error("Failed to fetch inventory", 500), {
      status: 500,
    });
  }

  const { data: priceData, error: priceError } = await supabase
    .from("purchase_invoice_item")
    .select("product_id, unit_price_local, quantity, created_at")
    .order("created_at", { ascending: false });

  if (priceError) {
    return NextResponse.json(error("Failed to fetch unit prices", 500), {
      status: 500,
    });
  }

  // Calculate WAC for each product (exclude FOC items, use quantity)
  const totalCostMap: Record<number, number> = {};
  const totalQtyMap: Record<number, number> = {};
  for (const item of priceData || []) {
    const productId = item.product_id;
    const unitPrice = item.unit_price_local;
    const qty = item.quantity || 0;
    if (unitPrice === 0) continue; // Exclude FOC
    totalCostMap[productId] = (totalCostMap[productId] || 0) + unitPrice * qty;
    totalQtyMap[productId] = (totalQtyMap[productId] || 0) + qty;
  }
  const wacMap: Record<number, number> = {};
  for (const productId in totalCostMap) {
    const totalQty = totalQtyMap[productId];
    wacMap[+productId] = totalQty > 0 ? totalCostMap[productId] / totalQty : 0;
  }

  type Totals = Record<number, { total_items: number; total_amount: number }>;
  const warehouseTotals: Totals = {};

  for (const row of inventoryData || []) {
    const { product_id, warehouse_id, quantity } = row;
    const unit_price = wacMap[product_id] || 0;
    if (!warehouseTotals[warehouse_id]) {
      warehouseTotals[warehouse_id] = { total_items: 0, total_amount: 0 };
    }
    warehouseTotals[warehouse_id].total_items += quantity;
    warehouseTotals[warehouse_id].total_amount += quantity * unit_price;
  }

  const mappedData: WarehouseInterface[] = (data || []).map((w) => {
    const totals = warehouseTotals[w.id] || {
      total_items: 0,
      total_amount: 0,
    };

    return {
      ...w,
      total_items: totals.total_items,
      total_amount: parseFloat(totals.total_amount.toFixed(2)),
    };
  });

  const response: WarehouseResponse = {
    items: mappedData || [],
    total: count || 0,
    page,
    pageSize,
  };

  return NextResponse.json(
    success(response, "Warehouses fetched successfully"),
    {
      status: 200,
    }
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
