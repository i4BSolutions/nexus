import { createClient } from "@/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { ApiResponse, PaginatedResponse } from "@/types/api-response-type";

type Supplier = {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  status: boolean;
  created_at: string;
  updated_at: string;
};

// This API route retrieves all suppliers from the database with pagination support.
export async function GET(
  req: NextRequest
): Promise<
  NextResponse<ApiResponse<PaginatedResponse<Supplier>> | ApiResponse<null>>
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
    .range(from, to);

  if (dbError) {
    return NextResponse.json(error("Failed to fetch suppliers", 500), {
      status: 500,
    });
  }

  // Get total count for pagination
  const { count } = await supabase
    .from("supplier")
    .select("*", { count: "exact", head: true });

  const response: PaginatedResponse<Supplier> = {
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
