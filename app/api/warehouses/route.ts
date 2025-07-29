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
// TODO: Link with stock management
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

  const mappedData: WarehouseInterface[] = (data || []).map((w) => ({
    ...w,
    total_items: Math.floor(Math.random() * 1000), // simulate 0-999 items
    total_amount: parseFloat((Math.random() * 100000).toFixed(2)), // simulate monetary total
  }));

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
