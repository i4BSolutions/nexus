import { createClient } from "@/lib/supabase/server";
import { error, success } from "@/lib/api-response";
import { ApiResponse } from "@/types/api-response-type";
import { NextRequest, NextResponse } from "next/server";
import { ProductCurrencyInterface } from "@/types/product/product.type";

export async function GET(
  _req: NextRequest
): Promise<NextResponse<ApiResponse<ProductCurrencyInterface[] | null>>> {
  const supabase = await createClient();

  const { data, error: dbError } = await supabase
    .from("product_currency")
    .select("*")
    .eq("is_active", true)
    .order("currency_name", { ascending: true });

  if (dbError) {
    return NextResponse.json(error("Failed to fetch currencies", 500), {
      status: 500,
    });
  }

  const currencies =
    data?.map((item) => ({
      id: item.id,
      currency_code: item.currency_code,
      currency_name: item.currency_name,
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at,
    })) || [];

  return NextResponse.json(
    success(currencies, "Currencies retrieved successfully"),
    { status: 200 }
  );
}
