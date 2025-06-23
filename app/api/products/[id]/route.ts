import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/api-response-type";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest
): Promise<NextResponse<ApiResponse<null>>> {
  const supabase = await createClient();
  const body = await req.json();

  const { id, sku, name, category, unit_price, min_stock, is_active } = body;
  if (!id)
    return NextResponse.json(error("Missing product ID", 400), { status: 400 });

  const { data: existing, error: fetchErr } = await supabase
    .from("product")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!existing || fetchErr) {
    return NextResponse.json(error("Product not found", 404), { status: 404 });
  }

  if (sku && sku !== existing.sku) {
    return NextResponse.json(
      error("SKU cannot be changed after creation", 400),
      { status: 400 }
    );
  }

  const { data: userInfo } = await supabase.auth.getUser();
  const updated_by = userInfo?.user?.email || "system";

  const { error: updateError } = await supabase
    .from("product")
    .update({
      name,
      category,
      unit_price,
      min_stock,
      is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(error("Failed to update product", 500), {
      status: 500,
    });
  }

  if (unit_price !== existing.unit_price) {
    await supabase.from("product_price_history").insert([
      {
        product_id: id,
        old_price: existing.unit_price,
        new_price: unit_price,
        updated_by,
      },
    ]);
  }

  return NextResponse.json(success(null, "Product updated successfully"), {
    status: 200,
  });
}

export async function DELETE(
  req: NextRequest
): Promise<NextResponse<ApiResponse<null>>> {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(error("Missing product ID", 400), { status: 400 });
  }

  // Check if product is referenced elsewhere
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
      error("Cannot delete a product that is referenced."),
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
