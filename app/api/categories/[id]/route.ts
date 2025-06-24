import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/api-response-type";
import { CategoryInterface } from "@/types/category/category.type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<CategoryInterface | null>>> {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  if (!id) {
    return NextResponse.json(error("Invalid category ID", 400), {
      status: 400,
    });
  }

  const supabase = await createClient();

  const { data, error: dbError } = await supabase
    .from("category")
    .select("*")
    .eq("id", id)
    .single();

  if (dbError) {
    return NextResponse.json(error("Failed to fetch category", 500), {
      status: 500,
    });
  }

  if (!data) {
    return NextResponse.json(error("Category not found", 404), {
      status: 404,
    });
  }

  return NextResponse.json(
    success<CategoryInterface>(data, "Category retrieved successfully"),
    {
      status: 200,
    }
  );
}
