import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { success, error } from "@/lib/api-response";
import { ApiResponse } from "@/types/shared/api-response-type";
import {
  RelatedSupplierItem,
  RelatedSupplierResponse,
} from "@/types/person/relationships/supplier.type";

/** ---------- GET /api/persons/suppliers/[id]?q=&status=&page=&pageSize= ---------- */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<
  NextResponse<ApiResponse<RelatedSupplierResponse> | ApiResponse<null>>
> {
  const supabase = await createClient();

  const { id } = await context.params;

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const pageSizeParam = searchParams.get("pageSize") || "10";
  const pageSize =
    pageSizeParam === "all" ? "all" : parseInt(pageSizeParam, 10);

  let query = supabase
    .from("supplier")
    .select("id,name,email,phone,status,contact_person_id", { count: "exact" })
    .eq("contact_person_id", id)
    .order("id", { ascending: false });

  if (pageSize !== "all") {
    query = query.range((page - 1) * pageSize, page * pageSize - 1);
  }

  const { data, error: dbError, count } = await query;

  if (dbError) {
    return NextResponse.json(
      error(`Failed to fetch related suppliers: ${dbError.message}`, 500),
      { status: 500 }
    );
  }

  const items: RelatedSupplierItem[] =
    (data || []).map((s: any) => ({
      id: s.id,
      supplier_name: s.name,
      email: s.email ?? null,
      phone: s.phone ?? null,
      status: s.status ? "Active" : "Inactive",
    })) ?? [];

  const response: RelatedSupplierResponse = {
    items,
    total: count || 0,
    page,
    pageSize: pageSize === "all" ? count || 0 : pageSize,
  };

  return NextResponse.json(
    success(response, "Related suppliers retrieved successfully"),
    { status: 200 }
  );
}
