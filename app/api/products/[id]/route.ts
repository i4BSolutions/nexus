import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/api-response-type";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest
): Promise<NextResponse<ApiResponse<null>>> {
  const supabase = await createClient();
  const body = await req.json();

  const { id, name, category, unit_price, min_stock, is_active } = body;

  if (!id) {
    return NextResponse.json(error("Missing product ID", 400), {
      status: 400,
    });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("product")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !existing) {
    return NextResponse.json(error("Product not found", 404), {
      status: 404,
    });
  }

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

  // Log price change if applicable
  if (unit_price !== existing.unit_price) {
    await supabase.from("product_price_history").insert([
      {
        product_id: id,
        old_price: existing.unit_price,
        new_price: unit_price,
        updated_by: "system", // Replace with session user ID if available
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
    return NextResponse.json(error("Missing product ID", 400), {
      status: 400,
    });
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
