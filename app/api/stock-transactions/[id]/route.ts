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
        is_voided,
        approval_order_no,
        approve_by_contact_id,
        product:product_id (
          name,
          sku
        ),
        warehouse:warehouse_id (
          name
        ),
        destination_warehouse:destination_warehouse_id (
          name
        ),
        approved_by:approve_by_contact_id (
          name
        )
      `
    )
    .eq("id", id)
    .single();

  if (fetchError) {
    return NextResponse.json(
      error(fetchError.message || "Failed to fetch stock transaction"),
      {
        status: 500,
      }
    );
  }

  let evidence: Array<{
    key: string;
    name?: string | null;
    mime?: string | null;
    size?: number | null;
    type?: string | null; // "photo" | "pdf"
    url: string;
  }> = [];

  if (rawData.type === "IN") {
    const { data: inAssets } = await supabase
      .from("stock_in_evidence")
      .select("file_key, mime_type, size_bytes")
      .eq("stock_in_id", rawData.id);

    if (inAssets) {
      evidence = inAssets.map((a) => ({
        key: a.file_key,
        name: a.file_key?.split("/").pop() ?? null,
        mime: a.mime_type,
        size: a.size_bytes,
        type:
          (a.mime_type || "").toLowerCase() === "application/pdf"
            ? "pdf"
            : "photo",
        url: `/api/uploads/direct?key=${encodeURIComponent(a.file_key)}`,
      }));
    }
  } else {
    const { data: outAssets } = await supabase
      .from("stock_transaction_assets")
      .select("storage_key, original_filename, mime, size_bytes, type")
      .eq("transaction_id", rawData.id);

    if (outAssets) {
      evidence = outAssets.map((a) => ({
        key: a.storage_key,
        name: a.original_filename,
        mime: a.mime,
        size: a.size_bytes,
        type: a.type,
        url: `/api/uploads/direct?key=${encodeURIComponent(a.storage_key)}`,
      }));
    }
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
      direction: data.type === "IN" ? "Stock In" : "Stock Out",
      approved_by: data.approved_by?.name ?? null,
      approval_order_no: data.approval_order_no ?? null,
      destination_warehouse: data.destination_warehouse?.name ?? null,
      quantity: data.quantity,
      reference: data.invoice_line_item_id ?? "",
      note: data.note,
      is_voided: data.is_voided,
      evidence,
    };
  };

  return NextResponse.json(success(formatData(rawData)), { status: 200 });
}
