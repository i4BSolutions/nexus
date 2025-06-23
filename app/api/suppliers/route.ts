import { createClient } from "@/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { ApiResponse, PaginatedResponse } from "@/types/api-response-type";
import { SupplierInterface } from "@/types/supplier/supplier.type";

// This API route retrieves all suppliers from the database with pagination support in descending order.
export async function GET(
  req: NextRequest
): Promise<
  NextResponse<
    ApiResponse<PaginatedResponse<SupplierInterface>> | ApiResponse<null>
  >
> {
  const supabase = await createClient();

  // Parse query params
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Fetch paginated data
  const { data: items, error: dbError } = await supabase
    .from("supplier")
    .select("*", { count: "exact" })
    .range(from, to)
    .order("inserted_at", { ascending: false });

  if (dbError) {
    return NextResponse.json(error("Failed to fetch suppliers", 500), {
      status: 500,
    });
  }

  // Get total count for pagination
  const { count } = await supabase
    .from("supplier")
    .select("*", { count: "exact", head: true });

  const response: PaginatedResponse<SupplierInterface> = {
    items: items || [],
    total: count || 0,
    page,
    pageSize,
  };

  return NextResponse.json(
    success(response, "Suppliers retrieved successfully"),
    { status: 200 }
  );
}

// This API route creates a new supplier in the database.
export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<SupplierInterface> | ApiResponse<null>>> {
  const supabase = await createClient();

  try {
    const body = await req.json();

    const { name, contact_person, email, phone, address, status } = body;

    if (!name || !email || !contact_person) {
      return NextResponse.json(
        error("Name, email, and contact person are required", 400),
        { status: 400 }
      );
    }

    const { data, error: dbError } = await supabase
      .from("supplier")
      .insert([
        {
          name,
          contact_person,
          email,
          phone,
          address,
          status: status ?? true, // Default to true if not provided
        },
      ])
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        error("Failed to create supplier: " + dbError?.message, 500),
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(success(data, "Supplier created successfully"), {
      status: 201,
    });
  } catch (e) {
    return NextResponse.json(error("Invalid request body", 400), {
      status: 400,
    });
  }
}
