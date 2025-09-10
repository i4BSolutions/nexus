"use server";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { success, error } from "@/lib/api-response";
import { ApiResponse } from "@/types/shared/api-response-type";
import { ProductAliasInterface } from "@/types/product/alias/alias.type";

// GET /api/product-alias/aliases
export async function GET(): Promise<
  NextResponse<ApiResponse<ProductAliasInterface[]> | ApiResponse<any>>
> {
  const supabase = await createClient();

  const { data, error: dbError } = await supabase
    .from("product_alias")
    .select(
      `
      id,
      created_at,
      name,
      type_id,
      language_id,
      product_id,
      type:product_alias_type ( id, name ),
      language:product_alias_language ( id, name ),
      product:product ( id, name )
    `
    )
    .order("created_at", { ascending: true });

  if (dbError) {
    return NextResponse.json(
      error("Failed to fetch product aliases: " + dbError.message, 500),
      { status: 500 }
    );
  }

  return NextResponse.json(success(data ?? [], "Product aliases fetched"), {
    status: 200,
  });
}

// POST /api/product-alias/aliases
export async function POST(
  req: NextRequest
): Promise<
  NextResponse<ApiResponse<ProductAliasInterface> | ApiResponse<any>>
> {
  const supabase = await createClient();

  try {
    const body = await req.json();
    const name: string = (body?.name ?? "").trim();
    const type_id: number | undefined = body?.type_id;
    const language_id: number | undefined = body?.language_id;
    const product_id: number | undefined = body?.product_id;

    if (!name || !product_id) {
      return NextResponse.json(error("Name and product_id are required", 400), {
        status: 400,
      });
    }

    const { data, error: dbError } = await supabase
      .from("product_alias")
      .insert([{ name, type_id, language_id, product_id }])
      .select(
        `
        id,
        created_at,
        name,
        type_id,
        language_id,
        product_id,
        type:product_alias_type ( id, name ),
        language:product_alias_language ( id, name ),
        product:product ( id, name )
      `
      )
      .single();

    if (dbError) {
      // Handle unique violation (duplicate alias name)
      if ((dbError as any).code === "23505") {
        return NextResponse.json(error("Alias name already exists", 409), {
          status: 409,
        });
      }
      return NextResponse.json(
        error("Failed to create product alias: " + dbError.message, 500),
        { status: 500 }
      );
    }

    return NextResponse.json(
      success(data, "Product alias created successfully"),
      { status: 201 }
    );
  } catch {
    return NextResponse.json(error("Invalid request body", 400), {
      status: 400,
    });
  }
}
