import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { success, error } from "@/lib/api-response";
import {
  StockTransactionInterface,
  StockTransactionInterfaceResponse,
} from "@/types/stock/stock.type";
import { ApiResponse } from "@/types/shared/api-response-type";

function formatDateTime(timestamp: string) {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
}

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<StockTransactionInterfaceResponse | any>>> {
  const supabase = await createClient();
  const { searchParams } = req.nextUrl;

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const productId = searchParams.get("product");
  const warehouseId = searchParams.get("warehouse");
  const directionParam = searchParams.get("direction")?.toLowerCase();
  const start = searchParams.get("start_date");
  const end = searchParams.get("end_date");

  let direction: "IN" | "OUT" | undefined;
  if (directionParam === "stock in") direction = "IN";
  if (directionParam === "stock out") direction = "OUT";

  // 1. Fetch all filtered transactions
  let query = supabase
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
    .order("created_at", { ascending: false });

  if (productId) query = query.eq("product_id", productId);
  if (warehouseId) query = query.eq("warehouse_id", warehouseId);
  if (direction) query = query.eq("type", direction);
  if (start && end)
    query = query.gte("created_at", start).lte("created_at", end);

  const { data: rawTransactions, error: fetchError } = await query;

  if (fetchError || !rawTransactions) {
    return NextResponse.json(error("Failed to fetch transactions", 500));
  }

  // 2. Collect invoice_line_item_ids
  const invoiceLineItemIds = rawTransactions
    .map((tx) => tx.invoice_line_item_id)
    .filter((id): id is number => id !== null);

  // 3. Fetch invoice numbers
  let invoiceMap: Record<number, string> = {};
  if (invoiceLineItemIds.length > 0) {
    const { data: invoiceItems } = await supabase
      .from("purchase_invoice_item")
      .select(
        `id, purchase_invoice:purchase_invoice_id ( purchase_invoice_number )`
      )
      .in("id", invoiceLineItemIds);

    invoiceMap = (invoiceItems || []).reduce((acc, item: any) => {
      if (item?.purchase_invoice?.purchase_invoice_number) {
        acc[item.id] = item.purchase_invoice.purchase_invoice_number;
      }
      return acc;
    }, {} as Record<number, string>);
  }

  // 4. Format all transactions
  const formatted = rawTransactions.map(
    (tx: any): StockTransactionInterface => {
      const { date, time } = formatDateTime(tx.created_at);
      const reference =
        tx.invoice_line_item_id && invoiceMap[tx.invoice_line_item_id]
          ? invoiceMap[tx.invoice_line_item_id]
          : tx.reason || "-";

      return {
        id: tx.id,
        date,
        time,
        sku: tx.product?.sku || "-",
        name: tx.product?.name || "-",
        warehouse: tx.warehouse?.name || "-",
        direction: tx.type === "IN" ? "Stock In" : "Stock Out",
        quantity: tx.quantity,
        reference,
        note: tx.note || "-",
      };
    }
  );

  const total = formatted.length;
  const paged = formatted.slice((page - 1) * pageSize, page * pageSize);

  return NextResponse.json(
    success({
      items: paged,
      total,
      page,
      pageSize,
    } as StockTransactionInterfaceResponse),
    {
      status: 200,
    }
  );
}
