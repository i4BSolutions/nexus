"use server";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { success, error } from "@/lib/api-response";
import { ApiResponse } from "@/types/shared/api-response-type";
import { ProductAliasInterface } from "@/types/product/alias/alias.type";

// PUT /api/product-alias/aliases
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<
  NextResponse<ApiResponse<ProductAliasInterface> | ApiResponse<any>>
> {
  const supabase = await createClient();

  try {
    const body = await req.json();
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);

    if (!id) {
      return NextResponse.json(error("id is required", 400), { status: 400 });
    }

    // Build a partial update payload
    const updatePayload: Record<string, any> = {};
    if (body.hasOwnProperty("name")) {
      const name = String(body.name ?? "").trim();
      if (!name) {
        return NextResponse.json(error("name cannot be empty", 400), {
          status: 400,
        });
      }
      updatePayload.name = name;
    }
    if (body.hasOwnProperty("type_id")) updatePayload.type_id = body.type_id;
    if (body.hasOwnProperty("language_id"))
      updatePayload.language_id = body.language_id;
    if (body.hasOwnProperty("product_id"))
      updatePayload.product_id = body.product_id;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        error("Provide at least one field to update", 400),
        { status: 400 }
      );
    }

    const { data, error: dbError } = await supabase
      .from("product_alias")
      .update(updatePayload)
      .eq("id", id)
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
      // Unique violation (e.g. duplicate alias name)
      if ((dbError as any).code === "23505") {
        return NextResponse.json(error("Alias name already exists", 409), {
          status: 409,
        });
      }
      // No rows found for .single()
      if ((dbError as any).code === "PGRST116") {
        return NextResponse.json(error("Product alias not found", 404), {
          status: 404,
        });
      }
      return NextResponse.json(
        error("Failed to update product alias: " + dbError.message, 500),
        { status: 500 }
      );
    }

    return NextResponse.json(
      success(data, "Product alias updated successfully"),
      { status: 200 }
    );
  } catch {
    return NextResponse.json(error("Invalid request body", 400), {
      status: 400,
    });
  }
}

// DELETE /api/product-alias/aliases
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ id: number }> | ApiResponse<any>>> {
  const supabase = await createClient();

  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  if (!id || Number.isNaN(id)) {
    return NextResponse.json(error("id is required", 400), { status: 400 });
  }

  const { data, error: dbError } = await supabase
    .from("product_alias")
    .delete()
    .eq("id", id)
    .select("id");

  if (dbError) {
    // Foreign key violation (record is referenced elsewhere)
    if ((dbError as any).code === "23503") {
      return NextResponse.json(
        error(
          "Cannot delete this alias because it is referenced by other records",
          409
        ),
        { status: 409 }
      );
    }
    return NextResponse.json(
      error("Failed to delete product alias: " + dbError.message, 500),
      { status: 500 }
    );
  }

  if (!data || data.length === 0) {
    return NextResponse.json(error("Product alias not found", 404), {
      status: 404,
    });
  }

  return NextResponse.json(success({ id }, "Product alias deleted"), {
    status: 200,
  });
}
