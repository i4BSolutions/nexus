import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse, PaginatedResponse } from "@/types/api-response-type";
import { ProductInterface } from "@/types/product/product.type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest
): Promise<
  NextResponse<
    ApiResponse<PaginatedResponse<ProductInterface>> | ApiResponse<null>
  >
> {
  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "";
  const category = searchParams.get("category") || "";
  const isActive = searchParams.get("is_active");
  const sort = searchParams.get("sort") || "name";

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Apply filters to the query
  let query = supabase
    .from("product")
    .select("*", { count: "exact" })
    .order(sort, { ascending: true });

  if (name) query = query.ilike("name", `%${name}%`);
  if (category) query = query.eq("category", category);
  if (isActive !== null) query = query.eq("is_active", isActive === "true");

  // Apply pagination
  const { data: items, count, error: dbError } = await query.range(from, to);

  if (dbError) {
    return NextResponse.json(error("Failed to fetch products", 500), {
      status: 500,
    });
  }

  const response: PaginatedResponse<ProductInterface> = {
    items: items || [],
    total: count || 0,
    page,
    pageSize,
  };

  return NextResponse.json(
    success(response, "Products retrieved successfully"),
    { status: 200 }
  );
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<ProductInterface> | ApiResponse<null>>> {
  const supabase = await createClient();

  try {
    const body = await req.json();
    const {
      sku,
      name,
      category,
      unit_price,
      min_stock,
      is_active = true,
    } = body;

    // Validate required fields
    if (!sku || !name || !category || unit_price == null || min_stock == null) {
      return NextResponse.json(
        error(
          "SKU, name, category, unit_price, and min_stock are required",
          400
        ),
        { status: 400 }
      );
    }

    // Ensure SKU is unique
    const { data: exists } = await supabase
      .from("product")
      .select("id")
      .eq("sku", sku)
      .maybeSingle();

    if (exists) {
      return NextResponse.json(error("SKU already exists. Retry again.", 409), {
        status: 409,
      });
    }

    // Create product
    const { data, error: dbError } = await supabase
      .from("product")
      .insert([
        {
          sku,
          name,
          category,
          unit_price,
          min_stock,
          is_active,
        },
      ])
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        error("Failed to create product: " + dbError.message, 500),
        { status: 500 }
      );
    }

    return NextResponse.json(success(data, "Product created successfully"), {
      status: 201,
    });
  } catch (e) {
    return NextResponse.json(error("Invalid request body", 400), {
      status: 400,
    });
  }
}
