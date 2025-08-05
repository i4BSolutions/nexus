import { createClient } from "@/lib/supabase/server";
import { error, success } from "@/lib/api-response";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/shared/api-response-type";
import { BudgetAllocationHistory } from "@/types/purchase-order/purchase-order-detail.type";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<BudgetAllocationHistory | any>>> {
  const supabase = await createClient();
  const { id: poId } = await context.params;
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSizeParam = searchParams.get("pageSize") || "10";
  const pageSize =
    pageSizeParam === "all" ? "all" : parseInt(pageSizeParam, 10);
  const from = (page - 1) * (pageSize === "all" ? 0 : pageSize);
  const to = pageSize === "all" ? undefined : from + pageSize - 1;

  // Get PO with budget and exchange rate
  const { data: po, error: poError } = await supabase
    .from("purchase_order")
    .select(
      "id, budget_id, usd_exchange_rate, currency:currency_id(id, currency_code, currency_name)"
    )
    .eq("id", poId)
    .single();

  console.log("PO Data:", po);

  if (poError || !po?.budget_id) {
    return NextResponse.json(error("Purchase order or budget not found"), {
      status: 404,
    });
  }

  // Get PO items to calculate total PO local
  const { data: poItems, error: poItemsError } = await supabase
    .from("purchase_order_items")
    .select("quantity, unit_price_local")
    .eq("purchase_order_id", poId);

  if (poItemsError) {
    return NextResponse.json(error("Failed to fetch PO items"), {
      status: 500,
    });
  }

  const totalPOLocal =
    poItems?.reduce(
      (sum, item) => sum + item.quantity * item.unit_price_local,
      0
    ) || 0;
  const totalPOUSD = totalPOLocal / po.usd_exchange_rate;

  // Fetch ALL allocations (for stats)
  const { data: allAllocations, error: allError } = await supabase
    .from("budget_allocation")
    .select("*")
    .eq("budget_id", po.budget_id);

  if (allError) {
    return NextResponse.json(error("Failed to calculate allocation stats"), {
      status: 500,
    });
  }

  const totalAllocatedUSD =
    allAllocations?.reduce((sum, a) => sum + (a.equivalent_usd || 0), 0) || 0;

  const totalAllocatedLocal = totalAllocatedUSD * po.usd_exchange_rate;

  const totalRemainingLocal = totalPOLocal - totalAllocatedLocal;
  const totalRemainingUSD = totalPOUSD - totalAllocatedUSD;

  const allocationProgress =
    totalPOUSD > 0 ? Math.min(100, (totalAllocatedUSD / totalPOUSD) * 100) : 0;

  // Fetch paginated allocations
  let query = supabase
    .from("budget_allocation")
    .select("*, budget:budget_id(budget_name, currency_code)", {
      count: "exact",
    })
    .eq("budget_id", po.budget_id)
    .order("created_at", { ascending: false });

  if (pageSize !== "all" && typeof to === "number") {
    query = query.range(from, to);
  }

  const { data: items, error: allocError, count } = await query;

  if (allocError) {
    return NextResponse.json(error("Failed to fetch budget allocations"), {
      status: 500,
    });
  }

  console.log("Fetched Budget Allocations:", items);

  const dto = items.map((item) => ({
    id: item.id,
    budget_no: item.budget?.budget_name || "",
    allocation_date: item.created_at,
    currency_code: item?.currency_code || "",
    allocated_amount_local: item.allocation_amount,
    allocated_amount_usd: item.equivalent_usd,
    status: item.status,
  }));

  const currency = Array.isArray(po.currency) ? po.currency[0] : po.currency;

  return NextResponse.json(
    success({
      budgetAllocations: dto,
      statistics: {
        total_po_amount_usd: parseFloat(totalPOUSD.toFixed(2)),
        total_po_amount_local: parseFloat(totalPOLocal.toFixed(2)),
        total_allocated_usd: parseFloat(totalAllocatedUSD.toFixed(2)),
        total_allocated_local: parseFloat(totalAllocatedLocal.toFixed(2)),
        total_remaining_usd: parseFloat(totalRemainingUSD.toFixed(2)),
        total_remaining_local: parseFloat(totalRemainingLocal.toFixed(2)),
        allocation_progress_percent: parseFloat(allocationProgress.toFixed(2)),
        purchase_order_currency_code: currency?.currency_code || "",
      },
      total: count || 0,
      page,
      pageSize: pageSize === "all" ? count || 0 : pageSize,
    }),
    { status: 200 }
  );
}
