import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import {
  ProductInterface,
  ProductResponse,
} from "@/types/product/product.type";
import {
  ApiResponse,
  PaginatedResponse,
} from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<ProductResponse> | ApiResponse<null>>> {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search")?.trim() || "";
  const category = searchParams.get("category") || "";
  const stockStatus = searchParams.get("stock_status");
  const sort = searchParams.get("sort") || "sku";
  const isActiveParam =
    searchParams.get("is_active") ?? searchParams.get("status");

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSizeParam = searchParams.get("pageSize") || "10";
  const pageSize =
    pageSizeParam === "all" ? "all" : parseInt(pageSizeParam, 10);
  const from = (page - 1) * (pageSize === "all" ? 0 : pageSize);
  const to = pageSize === "all" ? undefined : from + pageSize - 1;

  try {
    // 1) Products
    const { data: allProductsData, error: allError } = await supabase
      .from("product")
      .select("*");

    if (allError || !allProductsData) {
      return NextResponse.json(error("Failed to fetch products", 500), {
        status: 500,
      });
    }

    // 2) Inventory
    const { data: inventoryData, error: inventoryError } = await supabase
      .from("inventory")
      .select("product_id, quantity");

    if (inventoryError || !inventoryData) {
      return NextResponse.json(error("Failed to fetch inventory", 500), {
        status: 500,
      });
    }

    // 3) Aliases (expects product_alias(product_id, name, ...))
    const { data: aliasData, error: aliasError } = await supabase
      .from("product_alias")
      .select("product_id, name");

    if (aliasError) {
      return NextResponse.json(error("Failed to fetch product aliases", 500), {
        status: 500,
      });
    }

    // Build stock map
    const stockMap = new Map<number, number>();
    for (const row of inventoryData) {
      const productId = row.product_id;
      const quantity = Number(row.quantity);
      stockMap.set(productId, (stockMap.get(productId) || 0) + quantity);
    }

    // Build alias map
    const aliasMap = new Map<number, string[]>();
    for (const a of aliasData ?? []) {
      const arr = aliasMap.get(a.product_id) ?? [];
      arr.push(a.name);
      aliasMap.set(a.product_id, arr);
    }

    // Attach computed fields to products
    const allProducts = allProductsData.map((product) => ({
      ...product,
      current_stock: stockMap.get(product.id) ?? 0,
      alias_names: aliasMap.get(product.id) ?? [],
    }));

    // Global counts
    const lowStock = allProducts.filter(
      (p) => p.current_stock <= p.min_stock && p.current_stock > 0
    ).length;
    const outOfStock = allProducts.filter((p) => p.current_stock === 0).length;

    // Filtering
    let filtered = [...allProducts];

    if (search) {
      const norm = (v: string) => v?.toLowerCase().normalize("NFC") || "";
      const s = norm(search);

      filtered = filtered.filter((p) => {
        const inName = norm(p.name).includes(s);
        const inSku = norm(p.sku).includes(s);
        const inAlias = (p.alias_names ?? []).some((an: string) =>
          norm(an).includes(s)
        );
        return inName || inSku || inAlias;
      });
    }

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (stockStatus === "low_stock") {
      filtered = filtered.filter(
        (p) => p.current_stock <= p.min_stock && p.current_stock > 0
      );
    } else if (stockStatus === "in_stock") {
      filtered = filtered.filter((p) => p.current_stock > p.min_stock);
    } else if (stockStatus === "out_of_stock") {
      filtered = filtered.filter((p) => p.current_stock === 0);
    }

    if (isActiveParam === "true") {
      filtered = filtered.filter((p) => p.is_active === true);
    } else if (isActiveParam === "false") {
      filtered = filtered.filter((p) => p.is_active === false);
    }

    // Sorting
    const [sortField = "sku", sortDirection = "desc"] = sort.split("_");
    const direction = sortDirection === "asc" ? 1 : -1;

    filtered.sort((a, b) => {
      const valA = a[sortField as keyof ProductInterface];
      const valB = b[sortField as keyof ProductInterface];

      if (typeof valA === "number" && typeof valB === "number") {
        return (valA - valB) * direction;
      }

      if (
        valA instanceof Date ||
        (typeof valA === "string" && !isNaN(Date.parse(valA)))
      ) {
        const timeA = new Date(valA as string).getTime();
        const timeB = new Date(valB as string).getTime();
        return (timeA - timeB) * direction;
      }

      return String(valA).localeCompare(String(valB)) * direction;
    });

    // Pagination
    const paginated =
      pageSize === "all" ? filtered : filtered.slice(from, (to as number) + 1);

    const response: ProductResponse = {
      items: paginated,
      total: allProducts.length,
      page,
      pageSize: pageSize === "all" ? filtered.length : pageSize,
      counts: {
        total: allProducts.length,
        lowStock,
        outOfStock,
      },
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
      currency_code_id,
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
          currency_code_id,
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
