import { success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";
import { ProductHistoryPaginatedResponse } from "@/types/product/product.type";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<ProductHistoryPaginatedResponse> | any>> {
  const { id } = await context.params;

  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const {
    data,
    error: dbError,
    count,
  } = await supabase
    .from("product_audit_log")
    .select("*, user_profiles(full_name)", { count: "exact" })
    .eq("product_id", id)
    .order("changed_at", { ascending: false })
    .range(from, to);

  if (dbError) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch audit logs",
        error: dbError,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    success(
      {
        items: data ?? [],
        pagination: {
          page,
          pageSize,
          totalPages: pageSize ? Math.ceil((count || 0) / pageSize) : 1,
        },
      },
      "Log history retrieved successfully"
    ),
    { status: 200 }
  );
}
