import { getAuthenticatedUser } from "@/helper/getUser";
import { createClient } from "@/lib/supabase/server";

import { NextRequest, NextResponse } from "next/server";

import { ApiResponse } from "@/types/shared/api-response-type";

import { error, success } from "@/lib/api-response";

import { StockTransactionInterface } from "@/types/stock/stock.type";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<StockTransactionInterface | any>>> {
  const supabase = await createClient();

  const { id } = await context.params;

  const { data: rawData, error: fetchError } = await supabase
    .from("stock_transaction")
    .select(
      `
        id,
        created_at,
        quantity,
        type,
        note,
        reason,
        invoice_line_item_id,
        product:product_id (
          name,
          sku
        ),
        warehouse:warehouse_id (
          name
        )
      `
    )
    .eq("id", id)
    .single();

  if (fetchError) {
    return NextResponse.json(error("Failed to fetch stock transaction"), {
      status: 500,
    });
  }

  const formatData = (data: any): StockTransactionInterface => {
    return {
      id: data.id,
      date: data.created_at ? data.created_at.split("T")[0] : "",
      time: data.created_at
        ? data.created_at.split("T")[1]?.split(".")[0] ?? ""
        : "",
      sku: data.product?.sku ?? "",
      name: data.product?.name ?? "",
      warehouse: data.warehouse?.name ?? "",
      direction: data.type === "in" ? "Stock In" : "Stock Out",
      quantity: data.quantity,
      reference: data.invoice_line_item_id ?? "",
      note: data.note,
      is_voided: data.is_voided,
    };
  };

  return NextResponse.json(success(formatData(rawData)), { status: 200 });
}
