import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse, PaginatedResponse } from "@/types/api-response-type";
import { ProductInterface } from "@/types/product/product.type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<
  NextResponse<
    | ApiResponse<
        PaginatedResponse<ProductInterface> & {
          lowStock: number;
          outOfStock: number;
        }
      >
    | ApiResponse<null>
  >
> {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search")?.trim() || "";
  const category = searchParams.get("category") || "";
  const stockStatus = searchParams.get("stock_status");
  const sort = searchParams.get("sort") || "name";

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    // Fetch all products for lowStock & outOfStock
    const { data: allProducts, error: allError } = await supabase
      .from("product")
      .select("*");

    if (allError || !allProducts) {
      return NextResponse.json(error("Failed to fetch products", 500), {
        status: 500,
      });
    }

    // Compute global counts (unfiltered)
    const lowStock = allProducts.filter(
      (p) => p.stock <= p.min_stock && p.stock > 0
    ).length;

    const outOfStock = allProducts.filter((p) => p.stock === 0).length;

    // Apply filters to compute `items` and `total`
    let filtered = [...allProducts];

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (stockStatus === "low_stock") {
      filtered = filtered.filter((p) => p.stock <= p.min_stock && p.stock > 0);
    } else if (stockStatus === "in_stock") {
      filtered = filtered.filter((p) => p.stock > p.min_stock);
    } else if (stockStatus === "out_of_stock") {
      filtered = filtered.filter((p) => p.stock === 0);
    }

    // Sort
    filtered.sort((a, b) => {
      const valA = a[sort as keyof ProductInterface];
      const valB = b[sort as keyof ProductInterface];
      return typeof valA === "string"
        ? String(valA).localeCompare(String(valB))
        : 0;
    });

    // Paginate
    const paginated = filtered.slice(from, to + 1);

    const response: PaginatedResponse<ProductInterface> & {
      lowStock: number;
      outOfStock: number;
    } = {
      items: paginated,
      total: allProducts.length,
      page,
      pageSize,
      lowStock,
      outOfStock,
    };

    return NextResponse.json(
      success(response, "Products retrieved successfully"),
      { status: 200 }
    );
  } catch (e) {
    console.error("Unexpected error:", e);
    return NextResponse.json(error("Unexpected error occurred", 500), {
      status: 500,
    });
  }
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
      stock,
      is_active = true,
      description,
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
          stock,
          is_active,
          description,
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
