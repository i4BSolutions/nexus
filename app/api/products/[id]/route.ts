import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/api-response-type";
import { ProductInterface } from "@/types/product/product.type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<ProductInterface | null>>> {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  const supabase = await createClient();

  if (!id) {
    return NextResponse.json(error("Invalid product ID", 400), {
      status: 400,
    });
  }

  const { data, error: dbError } = await supabase
    .from("product")
    .select("*")
    .eq("id", id)
    .single();

  if (dbError) {
    return NextResponse.json(error("Failed to retrieve product", 500), {
      status: 500,
    });
  }

  if (!data) {
    return NextResponse.json(error("Product not found", 404), {
      status: 404,
    });
  }

  return NextResponse.json(success(data, "Product retrieved successfully"), {
    status: 200,
  });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<ProductInterface | null>>> {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  if (!id) {
    return NextResponse.json(error("Invalid product ID", 400), { status: 400 });
  }

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("product")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!existing || fetchError) {
    return NextResponse.json(error("Product not found", 404), { status: 404 });
  }

  try {
    const body = await req.json();

    if (body.sku && body.sku !== existing.sku) {
      return NextResponse.json(error("SKU cannot be changed", 400), {
        status: 400,
      });
    }

    const updateData = {
      ...body,
      sku: existing.sku,
      updated_at: new Date().toISOString(),
    };

    const { data, error: dbError } = await supabase
      .from("product")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(error("Failed to update product", 500), {
        status: 500,
      });
    }

    // Track price changes
    if (body.unit_price != null && body.unit_price !== existing.unit_price) {
      const { data: auth } = await supabase.auth.getUser();
      const updated_by = auth?.user?.email || "system";

      await supabase.from("product_price_history").insert([
        {
          product_id: id,
          old_price: existing.unit_price,
          new_price: body.unit_price,
          updated_by,
        },
      ]);
    }

    return NextResponse.json(success(data, "Product updated successfully"), {
      status: 200,
    });
  } catch (e) {
    return NextResponse.json(error("Invalid request body", 400), {
      status: 400,
    });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  const supabase = await createClient();

  if (!id) {
    return NextResponse.json(error("Invalid product ID", 400), { status: 400 });
  }

  // Prevent deletion if referenced in PO, invoice, or stock movement
  const { data: po } = await supabase
    .from("po_items")
    .select("id")
    .eq("product_id", id)
    .limit(1);

  const { data: invoice } = await supabase
    .from("invoice_items")
    .select("id")
    .eq("product_id", id)
    .limit(1);

  const { data: stock } = await supabase
    .from("stock_movements")
    .select("id")
    .eq("product_id", id)
    .limit(1);

  if (po?.length || invoice?.length || stock?.length) {
    return NextResponse.json(
      error("Cannot delete a product that is referenced.", 400),
      { status: 400 }
    );
  }

  const { error: deleteError } = await supabase
    .from("product")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json(error("Failed to delete product", 500), {
      status: 500,
    });
  }

  return NextResponse.json(success(null, "Product deleted successfully"), {
    status: 200,
  });
}
