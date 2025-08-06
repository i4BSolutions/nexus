import { getAuthenticatedUser } from "@/helper/getUser";
import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { Budget, BudgetResponse } from "@/types/budgets/budgets.type";
import dayjs from "dayjs";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";

// export async function GET(
//   req: NextRequest
// ): Promise<NextResponse<ApiResponse<BudgetResponse | null>>> {
//   const supabase = await createClient();
//   const searchParams = req.nextUrl.searchParams;

//   const page = parseInt(searchParams.get("page") || "1");
//   const pageSizeParam = searchParams.get("pageSize") || "10";
//   const pageSize =
//     pageSizeParam === "all" ? "all" : parseInt(pageSizeParam, 10);
//   const q = searchParams.get("q")?.trim().toLowerCase() || "";
//   const sortParam = searchParams.get("sort");

//   // Parse boolean status filter
//   const statusFilter = searchParams.get("status");
//   let statusBoolean: boolean | undefined = undefined;
//   if (statusFilter === "true") statusBoolean = true;
//   else if (statusFilter === "false") statusBoolean = false;

//   let sortField: "created_at" | "project_name" | "budget_name" = "created_at";
//   let sortDirection: "asc" | "desc" = "desc";

//   if (sortParam) {
//     const lastUnderscoreIndex = sortParam.lastIndexOf("_");
//     const field = sortParam.substring(0, lastUnderscoreIndex);
//     const direction = sortParam.substring(lastUnderscoreIndex + 1);
//     if (["project_name", "budget_name", "created_at"].includes(field)) {
//       sortField = field as typeof sortField;
//       sortDirection = direction === "asc" ? "asc" : "desc";
//     }
//   }

//   try {
//     const { data: allBudgets, error: fetchError } = await supabase
//       .from("budgets")
//       .select("*");

//     if (fetchError || !allBudgets) {
//       return NextResponse.json(error("Failed to fetch budgets", 500));
//     }

//     // Filter budgets
//     const filteredBudgets = allBudgets.filter((b) => {
//       const matchSearch =
//         q === "" ||
//         b.budget_name.toLowerCase().includes(q) ||
//         b.project_name.toLowerCase().includes(q);
//       const matchStatus =
//         statusBoolean === undefined || b.status === statusBoolean;
//       return matchSearch && matchStatus;
//     });

//     // Sort budgets
//     const sorted = [...filteredBudgets].sort((a, b) => {
//       if (sortField === "created_at") {
//         return sortDirection === "asc"
//           ? dayjs(a.created_at).unix() - dayjs(b.created_at).unix()
//           : dayjs(b.created_at).unix() - dayjs(a.created_at).unix();
//       }
//       const valA = String(a[sortField] ?? "").toLowerCase();
//       const valB = String(b[sortField] ?? "").toLowerCase();
//       return sortDirection === "asc"
//         ? valA.localeCompare(valB)
//         : valB.localeCompare(valA);
//     });

//     let paginated;

//     if (pageSize === "all") {
//       paginated = sorted;
//     } else {
//       paginated = sorted.slice((page - 1) * pageSize, page * pageSize);
//     }

//     const budgetIds = paginated.map((b) => b.id);

//     const { data: allocations } = await supabase
//       .from("budget_allocation")
//       .select("budget_id, equivalent_usd")
//       .in("budget_id", budgetIds);

//     const { data: invoices } = await supabase
//       .from("purchase_invoice")
//       .select("purchase_order_id, exchange_rate_to_usd");

//     const { data: pos, error: poError } = await supabase
//       .from("purchase_order")
//       .select("*");

//     if (poError) throw poError;

//     // Enrich budgets
//     const enrichedItems = paginated.map((budget) => {
//       const planned_usd = Number(budget.planned_amount_usd || 0);

//       const allocs =
//         allocations?.filter((a) => a.budget_id === budget.id) || [];
//       const allocated = allocs.reduce(
//         (sum, a) => sum + (a.equivalent_usd || 0),
//         0
//       );

//       const invs =
//         invoices?.filter((i) => {
//           const relatedPO = pos.find((po) => po.id === i.purchase_order_id);
//           return relatedPO?.budget_id === budget.id;
//         }) || [];
//       const invoiced = invs.reduce(
//         (sum, i) => sum + (i.exchange_rate_to_usd || 0),
//         0
//       );

//       const budgetPOs = pos.filter((po) => po.budget_id === budget.id);
//       const po_count = budgetPOs.length;
//       const total_po_value = budgetPOs.reduce(
//         (sum, po) => sum + Number(po.planned_amount_usd || 0),
//         0
//       );

//       const allocated_variance = planned_usd - allocated;
//       const allocation_pct =
//         planned_usd > 0 ? (allocated / planned_usd) * 100 : 0;
//       const utilization_pct = allocated > 0 ? (invoiced / allocated) * 100 : 0;
//       const unutilized_usd = allocated - invoiced;

//       return {
//         ...budget,
//         planned_amount_usd: planned_usd,
//         allocated_amount_usd: Number(allocated.toFixed(2)),
//         invoiced_amount_usd: Number(invoiced.toFixed(2)),
//         allocated_variance_usd: Number(allocated_variance.toFixed(2)),
//         allocation_percentage: Number(allocation_pct.toFixed(2)),
//         utilization_percentage: Number(utilization_pct.toFixed(2)),
//         unutilized_amount_usd: Number(unutilized_usd.toFixed(2)),
//         is_over_allocated: allocation_pct > 100,
//         is_over_invoiced: invoiced > planned_usd,
//         po_count,
//         total_po_value: Number(total_po_value.toFixed(2)),
//       };
//     });

//     // Stats summary
//     const activeBudgets = enrichedItems.filter((b) => b.status === true);

//     const totalPlanned = activeBudgets.reduce(
//       (sum, b) => sum + b.planned_amount_usd,
//       0
//     );
//     const totalAllocated = enrichedItems.reduce(
//       (sum, b) => sum + b.allocated_amount_usd,
//       0
//     );
//     const totalInvoiced = enrichedItems.reduce(
//       (sum, b) => sum + b.invoiced_amount_usd,
//       0
//     );

//     const allocatedVsPlannedPercentage =
//       totalPlanned > 0 ? (totalAllocated / totalPlanned) * 100 : 0;

//     const invoicedVsAllocatedPercentage =
//       totalAllocated > 0 ? (totalInvoiced / totalAllocated) * 100 : 0;

//     const validUtilizations = enrichedItems
//       .filter(
//         (b) =>
//           b.status === true &&
//           b.allocated_amount_usd > 0 &&
//           b.invoiced_amount_usd > 0 &&
//           typeof b.utilization_percentage === "number" &&
//           !isNaN(b.utilization_percentage)
//       )
//       .map((b) => b.utilization_percentage);

//     const averageUtilization =
//       validUtilizations.length > 0
//         ? validUtilizations.reduce((sum, val) => sum + val, 0) /
//           validUtilizations.length
//         : 0;

//     const budgetsOverUtilized = enrichedItems.filter(
//       (b) => b.utilization_percentage > 100
//     ).length;
//     const budgetsUnderUtilized = enrichedItems.filter(
//       (b) => b.utilization_percentage < 50
//     ).length;

//     return NextResponse.json(
//       success(
//         {
//           items: enrichedItems,
//           total: allBudgets.length,
//           page,
//           pageSize: pageSize === "all" ? allBudgets.length : pageSize,
//           statistics: {
//             total: allBudgets.length,
//             active: allBudgets.filter((b) => b.status).length,
//             inactive: allBudgets.filter((b) => !b.status).length,
//             totalPlanned: Number(totalPlanned.toFixed(2)),
//             totalAllocated: Number(totalAllocated.toFixed(2)),
//             totalInvoiced: Number(totalInvoiced.toFixed(2)),
//             averageUtilization: Number(averageUtilization.toFixed(2)),
//             budgetsOverUtilized,
//             budgetsUnderUtilized,
//             invoicedVsAllocatedPercentage: Number(
//               invoicedVsAllocatedPercentage.toFixed(2)
//             ),
//             allocatedVsPlannedPercentage: Number(
//               allocatedVsPlannedPercentage.toFixed(2)
//             ),
//           },
//         },
//         "Budgets retrieved successfully"
//       ),
//       { status: 200 }
//     );
//   } catch (e) {
//     return NextResponse.json(error("Unexpected error retrieving budgets", 500));
//   }
// }

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

    const budgetIds = paginated.map((b) => b.id);

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

    const { data: invoices } = await supabase
      .from("purchase_invoice")
      .select("id, purchase_order_id, exchange_rate_to_usd, is_voided");

    const enrichedItems = paginated.map((budget) => {
      const planned_usd = Number(budget.planned_amount_usd || 0);

      const budgetPOs = pos?.filter((po) => po.budget_id === budget.id) || [];
      const poIds = budgetPOs.map((po) => po.id);

      const budgetAllocs =
        allocations?.filter((a) => poIds.includes(a.po_id)) || [];
      const allocated = budgetAllocs.reduce(
        (sum, a) => sum + Number(a.equivalent_usd || 0),
        0
      );

      const budgetInvoices =
        invoices?.filter((i) => poIds.includes(i.purchase_order_id)) || [];

      const validInvoices = budgetInvoices.filter((i) => !i.is_voided);

      const invoiced = validInvoices.reduce(
        (sum, i) => sum + (Number(i.exchange_rate_to_usd) || 0),
        0
      );

      const totalInvoiceAmount = budgetInvoices.reduce(
        (sum, i) => sum + (Number(i.exchange_rate_to_usd) || 0),
        0
      );

      const unutilized_usd = allocated - totalInvoiceAmount;

      const allocated_variance = planned_usd - allocated;
      const allocation_pct =
        planned_usd > 0 ? (allocated / planned_usd) * 100 : 0;
      const utilization_pct = allocated > 0 ? (invoiced / allocated) * 100 : 0;

      let totalPOValueUSD = 0;

      for (const po of budgetPOs) {
        const usdRate = Number(po.usd_exchange_rate || 1);
        const items =
          poItems?.filter(
            (item) => item.purchase_order_id === po.id && item.is_foc === false
          ) || [];

        const poTotalLocal = items.reduce((sum, item) => {
          const qty = Number(item.quantity || 0);
          const unitPrice = Number(item.unit_price_local || 0);
          return sum + qty * unitPrice;
        }, 0);

        const poValueUSD = poTotalLocal;
        totalPOValueUSD += poValueUSD;
      }

      return {
        ...budget,
        planned_amount_usd: planned_usd,
        allocated_amount_usd: Number(allocated.toFixed(2)),
        invoiced_amount_usd: Number(invoiced.toFixed(2)),
        allocated_variance_usd: Number(allocated_variance.toFixed(2)),
        allocation_percentage: Number(allocation_pct.toFixed(2)),
        utilization_percentage: Number(utilization_pct.toFixed(2)),
        unutilized_amount_usd: Number(unutilized_usd.toFixed(2)),
        is_over_allocated: allocation_pct > 100,
        is_over_invoiced: invoiced > planned_usd,
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

    const budgetsOverUtilized = activeBudgets.filter(
      (b) => b.utilization_percentage > 110
    ).length;
    const budgetsUnderUtilized = activeBudgets.filter(
      (b) => b.utilization_percentage < 50
    ).length;

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
            budgetsOverUtilized,
            budgetsUnderUtilized,
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
