import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/api-response-type";
import { CategoryInterface } from "@/types/category/category.type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest
): Promise<NextResponse<ApiResponse<CategoryInterface[] | null>>> {
  const supabase = await createClient();

  const { data, error: dbError } = await supabase
    .from("category")
    .select("*")
    .order("category_name", { ascending: true });

  if (dbError) {
    return NextResponse.json(error("Failed to fetch categories", 500), {
      status: 500,
    });
  }

  return NextResponse.json(
    success(data || [], "Categories retrieved successfully"),
    { status: 200 }
  );
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<CategoryInterface> | ApiResponse<null>>> {
  const supabase = await createClient();

  try {
    const body = await req.json();
    const { category_name } = body;

    if (!category_name || typeof category_name !== "string") {
      return NextResponse.json(error("Category name is required", 400), {
        status: 400,
      });
    }

    // Check if category already exists (case-insensitive)
    const { data: existing } = await supabase
      .from("category")
      .select("id")
      .ilike("category_name", category_name)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(error("Category already exists", 409), {
        status: 409,
      });
    }

    const { data, error: dbError } = await supabase
      .from("category")
      .insert([{ category_name }])
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        error("Failed to create category: " + dbError.message, 500),
        { status: 500 }
      );
    }

    return NextResponse.json(success(data, "Category created successfully"), {
      status: 201,
    });
  } catch {
    return NextResponse.json(error("Invalid request body", 400), {
      status: 400,
    });
  }
}
