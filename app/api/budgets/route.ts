import { getAuthenticatedUser } from "@/helper/getUser";
import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { Budget, BudgetResponse } from "@/types/budgets/budgets.type";
import dayjs from "dayjs";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<BudgetResponse | null>>> {
  const supabase = await createClient();
  const searchParams = req.nextUrl.searchParams;

  const page = parseInt(searchParams.get("page") || "1");
  const pageSizeParam = searchParams.get("pageSize") || "10";
  const pageSize =
    pageSizeParam === "all" ? "all" : parseInt(pageSizeParam, 10);

  const q = searchParams.get("q")?.trim().toLowerCase() || "";
  const statusFilter = searchParams.get("status");

  const sortParam = searchParams.get("sort");

  let sortField: "created_at" | "project_name" | "budget_name" = "created_at";
  let sortDirection: "asc" | "desc" = "desc";

  if (sortParam) {
    const lastUnderscoreIndex = sortParam.lastIndexOf("_");
    const field = sortParam.substring(0, lastUnderscoreIndex);
    const direction = sortParam.substring(lastUnderscoreIndex + 1);
    if (["project_name", "budget_name", "created_at"].includes(field)) {
      sortField = field as typeof sortField;
      sortDirection = direction === "asc" ? "asc" : "desc";
    }
  }

  try {
    const { data: allBudgets, error: fetchError } = await supabase
      .from("budgets")
      .select("*");

    if (fetchError || !allBudgets) {
      return NextResponse.json(error("Failed to fetch budgets", 500));
    }

    const filteredBudgets = allBudgets.filter((b) => {
      const matchesSearch =
        q === "" ||
        b.budget_name.toLowerCase().includes(q) ||
        b.project_name.toLowerCase().includes(q);
      const matchesStatus =
        !statusFilter || b.status === (statusFilter === "true");
      return matchesSearch && matchesStatus;
    });

    const sorted = [...filteredBudgets].sort((a, b) => {
      if (sortField === "created_at") {
        return sortDirection === "asc"
          ? dayjs(a.created_at).unix() - dayjs(b.created_at).unix()
          : dayjs(b.created_at).unix() - dayjs(a.created_at).unix();
      }
      const valA = String(a[sortField] ?? "").toLowerCase();
      const valB = String(b[sortField] ?? "").toLowerCase();
      return sortDirection === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });

    const paginated =
      pageSize === "all"
        ? sorted
        : sorted.slice((page - 1) * pageSize, page * pageSize);

    // Load all required data
    const { data: pos } = await supabase
      .from("purchase_order")
      .select("id, budget_id, usd_exchange_rate");

    const { data: poItems } = await supabase
      .from("purchase_order_items")
      .select("purchase_order_id, quantity, unit_price_local, is_foc");

    const { data: allocations } = await supabase
      .from("budget_allocation")
      .select("id, po_id, equivalent_usd");

    const { data: invoiceItems } = await supabase
      .from("purchase_invoice_item")
      .select(
        "purchase_invoice_id, purchase_order_id, quantity, unit_price_local"
      );

    const { data: invoices } = await supabase
      .from("purchase_invoice")
      .select("id, purchase_order_id, exchange_rate_to_usd, is_voided");

    const { data: poSmartStatuses } = await supabase
      .from("purchase_order_smart_status")
      .select("id, purchase_order_id, status, created_at");

    const latestSmartStatusByPO: Record<number, string> = {};
    poSmartStatuses
      ?.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .forEach((s) => {
        if (!latestSmartStatusByPO[s.purchase_order_id]) {
          latestSmartStatusByPO[s.purchase_order_id] = s.status;
        }
      });

    // const enrichedItems = paginated.map((budget) => {
    //   const planned_usd = Number(budget.planned_amount_usd || 0);
    //   const budgetPOs = pos?.filter((po) => po.budget_id === budget.id) || [];
    //   const poIds = budgetPOs.map((po) => po.id);

    //   const activePOIds = budgetPOs
    //     .filter((po) => latestSmartStatusByPO[po.id] !== "Cancel")
    //     .map((po) => po.id);

    //   const activeAllocs =
    //     allocations?.filter((a) => activePOIds.includes(a.po_id)) || [];

    //   const allocated = activeAllocs.reduce(
    //     (sum, a) => sum + Number(a.equivalent_usd || 0),
    //     0
    //   );

    //   const allocated_variance = planned_usd - allocated;

    //   const allocation_pct =
    //     planned_usd > 0 ? (allocated / planned_usd) * 100 : 0;

    //   const relatedInvoices =
    //     invoices?.filter((i) => poIds.includes(i.purchase_order_id)) || [];

    //   let validInvoiceTotalUSD = 0;
    //   let totalInvoiceTotalUSD = 0;

    //   for (const inv of relatedInvoices) {
    //     const items =
    //       invoiceItems?.filter((it) => it.purchase_invoice_id === inv.id) || [];
    //     const invoiceLocalTotal = items.reduce(
    //       (sum, it) =>
    //         sum + Number(it.quantity || 0) * Number(it.unit_price_local || 0),
    //       0
    //     );
    //     const invoiceUSD =
    //       invoiceLocalTotal * Number(inv.exchange_rate_to_usd || 0);

    //     totalInvoiceTotalUSD += invoiceUSD;
    //     if (!inv.is_voided) {
    //       validInvoiceTotalUSD += invoiceUSD;
    //     }
    //   }

    //   const utilization_pct =
    //     allocated > 0 ? (validInvoiceTotalUSD / allocated) * 100 : 0;

    //   // Now voided invoice amounts will increase unutilized in real-time
    //   const unutilized_usd = allocated - totalInvoiceTotalUSD;

    //   let totalPOValueUSD = 0;
    //   for (const po of budgetPOs) {
    //     const items =
    //       poItems?.filter((i) => i.purchase_order_id === po.id && !i.is_foc) ||
    //       [];
    //     const poTotal = items.reduce((sum, item) => {
    //       return (
    //         sum +
    //         Number(item.quantity || 0) * Number(item.unit_price_local || 0)
    //       );
    //     }, 0);
    //     totalPOValueUSD += poTotal;
    //   }

    //   return {
    //     ...budget,
    //     planned_amount_usd: planned_usd,
    //     allocated_amount_usd: Number(allocated.toFixed(2)),
    //     allocated_variance_usd: Number(allocated_variance.toFixed(2)),
    //     invoiced_amount_usd: Number(validInvoiceTotalUSD.toFixed(2)),
    //     allocation_percentage: Number(allocation_pct.toFixed(2)),
    //     utilization_percentage: Number(utilization_pct.toFixed(2)),
    //     unutilized_amount_usd: Number(unutilized_usd.toFixed(2)),
    //     po_count: budgetPOs.length,
    //     total_po_value_usd: Number(totalPOValueUSD.toFixed(2)),
    //   };
    // });

    const enrichedItems = paginated.map((budget) => {
      const planned_usd = Number(budget.planned_amount_usd || 0);

      // Get POs for this budget
      const budgetPOs = pos?.filter((po) => po.budget_id === budget.id) || [];
      const poIds = budgetPOs.map((po) => po.id);

      // Active POs (not canceled)
      const activePOIds = budgetPOs
        .filter((po) => latestSmartStatusByPO[po.id] !== "Cancel")
        .map((po) => po.id);

      // Allocations
      const activeAllocs =
        allocations?.filter((a) => activePOIds.includes(a.po_id)) || [];
      const allocated = activeAllocs.reduce(
        (sum, a) => sum + Number(a.equivalent_usd || 0),
        0
      );
      const allocated_variance = planned_usd - allocated;
      const allocation_pct =
        planned_usd > 0 ? (allocated / planned_usd) * 100 : 0;

      // Invoices linked to this budget's POs

      const relatedInvoices =
        invoices?.filter((inv) => poIds.includes(inv.purchase_order_id)) || [];

      let invoicedUSD = 0;

      for (const inv of relatedInvoices) {
        const items =
          invoiceItems?.filter((it) => it.purchase_invoice_id === inv.id) || [];
        const itemsTotalLocal = items.reduce(
          (sum, it) =>
            sum + Number(it.quantity || 0) * Number(it.unit_price_local || 0),
          0
        );
        const usdValue =
          itemsTotalLocal / (Number(inv.exchange_rate_to_usd) || 1);

        if (!inv.is_voided) {
          invoicedUSD += usdValue;
        }
      }

      const utilization_pct =
        allocated > 0 ? (invoicedUSD / allocated) * 100 : 0;

      const unutilized_usd = allocated - invoicedUSD;

      // PO Value
      let totalPOValueUSD = 0;
      for (const po of budgetPOs) {
        const items =
          poItems?.filter((i) => i.purchase_order_id === po.id && !i.is_foc) ||
          [];
        const poTotal = items.reduce((sum, item) => {
          return (
            sum +
            Number(item.quantity || 0) * Number(item.unit_price_local || 0)
          );
        }, 0);
        totalPOValueUSD += poTotal;
      }

      return {
        ...budget,
        planned_amount_usd: planned_usd,
        allocated_amount_usd: Number(allocated.toFixed(2)),
        allocated_variance_usd: Number(allocated_variance.toFixed(2)),
        invoiced_amount_usd: Number(invoicedUSD.toFixed(2)),
        allocation_percentage: Number(allocation_pct.toFixed(2)),
        utilization_percentage: Number(utilization_pct.toFixed(2)),
        unutilized_amount_usd: Number(unutilized_usd.toFixed(2)),
        po_count: budgetPOs.length,
        total_po_value_usd: Number(totalPOValueUSD.toFixed(2)),
      };
    });

    // Statistics for dashboard
    const activeBudgets = enrichedItems.filter((b) => b.status === true);

    const totalPlanned = activeBudgets.reduce(
      (sum, b) => sum + b.planned_amount_usd,
      0
    );
    const totalAllocated = activeBudgets.reduce(
      (sum, b) => sum + b.allocated_amount_usd,
      0
    );
    const totalInvoiced = activeBudgets.reduce(
      (sum, b) => sum + b.invoiced_amount_usd,
      0
    );

    const allocatedVsPlannedPercentage =
      totalPlanned > 0 ? (totalAllocated / totalPlanned) * 100 : 0;
    const invoicedVsAllocatedPercentage =
      totalAllocated > 0 ? (totalInvoiced / totalAllocated) * 100 : 0;

    const validUtilizations = activeBudgets
      .filter(
        (b) => b.allocated_amount_usd > 0 && !isNaN(b.utilization_percentage)
      )
      .map((b) => b.utilization_percentage);

    const averageUtilization =
      validUtilizations.length > 0
        ? validUtilizations.reduce((sum, val) => sum + val, 0) /
          validUtilizations.length
        : 0;

    return NextResponse.json(
      success(
        {
          items: enrichedItems,
          total: allBudgets.length,
          page,
          pageSize: pageSize === "all" ? allBudgets.length : pageSize,
          statistics: {
            total: allBudgets.length,
            active: allBudgets.filter((b) => b.status === true).length,
            inactive: allBudgets.filter((b) => b.status === false).length,
            totalPlanned: Number(totalPlanned.toFixed(2)),
            totalAllocated: Number(totalAllocated.toFixed(2)),
            totalInvoiced: Number(totalInvoiced.toFixed(2)),
            allocatedVsPlannedPercentage: Number(
              allocatedVsPlannedPercentage.toFixed(2)
            ),
            invoicedVsAllocatedPercentage: Number(
              invoicedVsAllocatedPercentage.toFixed(2)
            ),
            averageUtilization: Number(averageUtilization.toFixed(2)),
          },
        },
        "Budgets retrieved successfully"
      ),
      { status: 200 }
    );
  } catch (e) {
    console.error("Budgets API error:", e);
    return NextResponse.json(error("Unexpected error retrieving budgets", 500));
  }
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<Budget | null>>> {
  const supabase = await createClient();
  const body = await req.json();
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const user = await getAuthenticatedUser(supabase);

  if (
    !body.budget_name ||
    !body.project_name ||
    !body.start_date ||
    !body.end_date ||
    !body.currency_code ||
    !body.exchange_rate_usd ||
    !body.planned_amount ||
    !body.status
  ) {
    return NextResponse.json(error("Invalid data", 400), { status: 400 });
  }

  // const planned_amount_usd = body.planned_amount / body.exchange_rate_usd;
  const { id, planned_amount_usd, ...payload } = body;
  const fullPayload = {
    ...payload,
    created_by: user.id,
  };

  const { data: created, error: dbError } = await supabase
    .from("budgets")
    .insert([fullPayload])
    .select()
    .single();

  if (dbError)
    return NextResponse.json(error(dbError.message, 500), {
      status: 500,
    });

  await supabase.from("budget_audit_logs").insert([
    {
      budget_id: created.id,
      action: "CREATE",
      changes: { new: fullPayload },
      performed_by: user.id,
      ip_address: ip,
    },
  ]);

  return NextResponse.json(success(created, "Budget created successfully"), {
    status: 201,
  });
}
