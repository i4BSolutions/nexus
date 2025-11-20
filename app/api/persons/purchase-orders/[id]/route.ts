import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { success, error } from "@/lib/api-response";
import { ApiResponse } from "@/types/shared/api-response-type";
import {
  RelatedPOItem,
  RelatedPOResponse,
} from "@/types/person/relationships/purchase-order.type";

/** ---------- GET /api/purchase-orders/related ---------- */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<RelatedPOResponse> | ApiResponse<null>>> {
  const supabase = await createClient();
  const { id } = await context.params;
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || "1");
  const pageSizeParam = searchParams.get("pageSize") || "10";
  const pageSize =
    pageSizeParam === "all" ? "all" : parseInt(pageSizeParam, 10);

  let query = supabase
    .from("purchase_order")
    .select(
      `
        id,
        purchase_order_no,
        order_date,
        expected_delivery_date,
        usd_exchange_rate,
        status,
        contact_person_id,
        supplier:supplier_id(name,status),
        currency:currency_id(currency_code),
        smart:purchase_order_smart_status(status),
        items:purchase_order_items(quantity,unit_price_local)
      `,
      { count: "exact" }
    )
    .eq("contact_person_id", id)
    .order("id", { ascending: false });

  // Pagination
  if (pageSize !== "all") {
    query = query.range((page - 1) * pageSize, page * pageSize - 1);
  }

  const { data, error: dbError, count } = await query;

  if (dbError) {
    return NextResponse.json(
      error(`Failed to fetch related purchase orders: ${dbError.message}`, 500),
      { status: 500 }
    );
  }

  // Map/compute amounts and normalize smart status
  const items: RelatedPOItem[] =
    (data || []).map((po: any) => {
      const lineItems: Array<{
        quantity: number;
        unit_price_local: string | number;
      }> = Array.isArray(po.items) ? po.items : [];

      const amountLocal = lineItems.reduce((sum, li) => {
        const qty = Number(li.quantity || 0);
        const price = Number(li.unit_price_local || 0);
        return sum + qty * price;
      }, 0);

      const rate = Number(po.usd_exchange_rate || 0);
      const amountUSD = rate > 0 ? amountLocal / rate : 0;

      const smartStatus =
        po?.smart && typeof po.smart === "object"
          ? (po.smart.status as string) // one-to-one
          : Array.isArray(po?.smart) && po.smart.length > 0
          ? (po.smart[0].status as string)
          : (po.status as string);

      return {
        id: po.id,
        purchase_order_no: po.purchase_order_no,
        supplier_name: po?.supplier?.name ?? "",
        supplier_active: !!po?.supplier?.status,
        order_date: po.order_date,
        expected_delivery_date: po.expected_delivery_date,
        currency_code: po?.currency?.currency_code ?? null,
        amount_local: amountLocal,
        amount_usd: amountUSD,
        status: smartStatus || "Not Started",
        approval_status: po.status,
      };
    }) ?? [];

  const response: RelatedPOResponse = {
    items,
    total: count || 0,
    page,
    pageSize: pageSize === "all" ? count || 0 : pageSize,
  };

  return NextResponse.json(
    success(response, "Related purchase orders retrieved successfully"),
    { status: 200 }
  );
}
