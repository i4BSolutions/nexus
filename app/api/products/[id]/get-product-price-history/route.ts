export const dynamic = "force-dynamic";

import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { ProductPriceHistoryInterface } from "@/types/product/product.type";
import { ApiResponse } from "@/types/shared/api-response-type";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<ProductPriceHistoryInterface[] | null>>> {
  const { id: idStr } = await context.params;
  const product_id = parseInt(idStr);

  if (!product_id) {
    return NextResponse.json(error("Invalid product ID", 400), { status: 400 });
  }

  const supabase = await createClient();

  const { data, error: dbError } = await supabase
    .from("product_price_history")
    .select(
      "id, product_id, old_price, new_price, reason, updated_by, created_at"
    )
    .eq("product_id", product_id)
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json(error("Failed to fetch price history", 500), {
      status: 500,
    });
  }

  return NextResponse.json(
    success(data ?? [], "Price history retrieved successfully"),
    { status: 200 }
  );
}
