import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { success, error } from "@/lib/api-response";
import { ApiResponse } from "@/types/shared/api-response-type";
import {
  RelatedTransactionItem,
  RelatedTransactionResponse,
} from "@/types/person/relationships/stock-transaction.type";

/** ---------- GET /api/persons/transactions/[id] ---------- */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<
  NextResponse<ApiResponse<RelatedTransactionResponse> | ApiResponse<null>>
> {
  const supabase = await createClient();

  const { id } = await context.params;

  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || "1");
  const pageSizeParam = searchParams.get("pageSize") || "10";
  const pageSize =
    pageSizeParam === "all" ? "all" : parseInt(pageSizeParam, 10);

  // Base query (non-voided, linked to this contact as approver)
  let query = supabase
    .from("stock_transaction")
    .select(
      `
        id,
        created_at,
        quantity,
        type,
        reason,
        note,
        evidence_photo_count,
        product:product_id(name, sku),
        warehouse:warehouse_id(name)
      `,
      { count: "exact" }
    )
    .eq("approve_by_contact_id", id)
    .eq("type", "OUT")
    .order("created_at", { ascending: false });

  // Pagination
  if (pageSize !== "all") {
    query = query.range((page - 1) * pageSize, page * pageSize - 1);
  }

  const { data, error: dbError, count } = await query;

  if (dbError) {
    return NextResponse.json(
      error(`Failed to fetch related transactions: ${dbError.message}`, 500),
      { status: 500 }
    );
  }

  const transactionIds = data.map((tx) => tx.id);

  let outEvidenceMap: Record<number, any[]> = {};

  if (transactionIds.length > 0) {
    const { data: outAssets } = await supabase
      .from("stock_transaction_assets")
      .select(
        "transaction_id, storage_key, original_filename, mime, size_bytes, type"
      )
      .in("transaction_id", transactionIds);

    if (outAssets) {
      outEvidenceMap = outAssets.reduce((acc, a) => {
        if (!acc[a.transaction_id]) acc[a.transaction_id] = [];
        acc[a.transaction_id].push({
          key: a.storage_key,
          name: a.original_filename,
          mime: a.mime,
          size: a.size_bytes,
          type: a.type,
          // always proxy through /api/uploads/direct
          url: `/api/uploads/direct?key=${encodeURIComponent(a.storage_key)}`,
        });
        return acc;
      }, {} as Record<number, any[]>);
    }
  }

  const items: RelatedTransactionItem[] =
    (data || []).map((row: any) => ({
      id: row.id,
      created_at: row.created_at,
      product_name: row?.product?.name ?? "",
      product_sku: row?.product?.sku ?? "",
      warehouse_name: row?.warehouse?.name ?? "",
      direction: row.type,
      quantity: Number(row.quantity || 0),
      reference: row.reason ?? null,
      note: row.note ?? null,
      evidence: outEvidenceMap[row.id],
    })) ?? [];

  const response: RelatedTransactionResponse = {
    items,
    total: count || 0,
    page,
    pageSize: pageSize === "all" ? count || 0 : pageSize,
  };

  return NextResponse.json(
    success(response, "Related transactions retrieved successfully"),
    { status: 200 }
  );
}
