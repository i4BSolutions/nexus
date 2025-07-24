// File: /app/api/stock-in/history/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { error, success } from "@/lib/api-response";
import { ApiResponse } from "@/types/shared/api-response-type";
import { StockTransactionHistory } from "@/types/stock/stock.type";

export async function GET(
  req: NextRequest
): Promise<
  NextResponse<ApiResponse<StockTransactionHistory[]> | ApiResponse<null>>
> {
  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "10");

  const { data, error: dbError } = await supabase
    .from("stock_transaction")
    .select(
      `
      id,
      quantity,
      created_at,
      product:product_id (
        name,
        sku
      ),
      warehouse:warehouse_id (
        name
      ),
      invoice:invoice_id (
        purchase_invoice_number
      )
    `
    )
    .eq("type", "IN")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (dbError) {
    return NextResponse.json(error("Failed to fetch stock-in history", 500), {
      status: 500,
    });
  }

  const result: StockTransactionHistory[] =
    data?.map((tx: any) => ({
      product_name: tx.product?.name,
      product_sku: tx.product?.sku,
      invoice_number: tx.invoice?.purchase_invoice_number,
      quantity: `+${tx.quantity}`,
      warehouse: tx.warehouse?.name,
      date: new Date(tx.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    })) ?? [];

  return NextResponse.json(success(result, "Stock-in history retrieved"), {
    status: 200,
  });
}
