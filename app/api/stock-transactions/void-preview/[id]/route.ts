import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { success, error } from "@/lib/api-response";
import { TxRow, VoidPreview } from "@/types/inventory/stock-transaction.type";
import { ApiResponse } from "@/types/shared/api-response-type";

type TxType = "IN" | "OUT";

function formatDateTime(ts: string) {
  const d = new Date(ts);
  return {
    date: d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<VoidPreview | any>>> {
  const { id: txId } = await context.params;
  const supabase = await createClient();

  console.log(txId);

  const { data: txRaw, error: txErr } = await supabase
    .from("stock_transaction")
    .select(
      `
      id,
      created_at,
      quantity,
      type,
      reason,
      note,
      is_voided,
      product_id,
      warehouse_id,
      product:product_id ( name, sku ),
      warehouse:warehouse_id ( name )
    `
    )
    .eq("id", txId)
    .single();

  const tx = txRaw as unknown as TxRow;

  if (txErr) {
    return NextResponse.json(error("Transaction not found", 404));
  }

  if (typeof tx.is_voided === "boolean" && tx.is_voided) {
    return NextResponse.json(error("Transaction is already voided", 409));
  }

  const productId = tx.product_id as number;
  const warehouseId = tx.warehouse_id as number;

  console.log(productId);
  console.log(warehouseId);

  const { data: allTx, error: sumErr } = await supabase
    .from("stock_transaction")
    .select("quantity, type")
    .eq("product_id", productId)
    .eq("warehouse_id", warehouseId);

  if (sumErr || !allTx) {
    console.log(sumErr);
    return NextResponse.json(error(sumErr.message, 500));
  }

  const { data: invData } = await supabase
    .from("inventory")
    .select("quantity")
    .eq("product_id", productId)
    .eq("warehouse_id", warehouseId)
    .single();

  const currentQty = invData?.quantity;

  const qty = Number(tx.quantity) || 0;
  const deltaIfVoided = tx.type === "IN" ? -qty : +qty;
  const newQty = currentQty + deltaIfVoided;

  const { date, time } = formatDateTime(tx.created_at);

  console.log(tx);

  const formatData: VoidPreview = {
    id: tx.id,
    type: tx.type,
    product_name: tx.product?.name,
    product_sku: tx.product?.sku,
    abs_delta: Math.abs(deltaIfVoided),
    warehouse_name: tx.warehouse?.name ?? "-",
    date,
    fromQty: currentQty,
    toQty: newQty,
    reference: tx.reason ?? "-",
  };

  return NextResponse.json(success(formatData), { status: 200 });
}
