import { getAuthenticatedUser } from "@/helper/getUser";
import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { Budget, BudgetResponse } from "@/types/budgets/budgets.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<BudgetResponse | null>>> {
  const supabase = await createClient();
  const searchParams = req.nextUrl.searchParams;

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const q = searchParams.get("q")?.trim().toLowerCase() || "";
  const sortParam = searchParams.get("sort");

  // Parse boolean status filter
  const statusFilter = searchParams.get("status");
  let statusBoolean: boolean | undefined = undefined;
  if (statusFilter === "true") statusBoolean = true;
  else if (statusFilter === "false") statusBoolean = false;

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

    // Filter budgets
    const filteredBudgets = allBudgets.filter((b) => {
      const matchSearch =
        q === "" ||
        b.budget_name.toLowerCase().includes(q) ||
        b.project_name.toLowerCase().includes(q);
      const matchStatus =
        statusBoolean === undefined || b.status === statusBoolean;
      return matchSearch && matchStatus;
    });

    // Sort budgets
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

    const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);
    const budgetIds = paginated.map((b) => b.id);

    const { data: allocations } = await supabase
      .from("budget_allocations")
      .select("budget_id, amount_usd")
      .in("budget_id", budgetIds);

    const { data: invoices } = await supabase
      .from("budget_invoices")
      .select("budget_id, amount_usd")
      .in("budget_id", budgetIds);

    // Enrich budgets
    const enrichedItems = paginated.map((budget) => {
      const allocs =
        allocations?.filter((a) => a.budget_id === budget.id) || [];
      const invs = invoices?.filter((i) => i.budget_id === budget.id) || [];

      const allocated_amount_usd = allocs.reduce(
        (sum, a) => sum + (a.amount_usd || 0),
        0
      );
      const invoiced_amount_usd = invs.reduce(
        (sum, i) => sum + (i.amount_usd || 0),
        0
      );

      const planned_amount_usd = Number(budget.planned_amount_usd || 0);
      const allocated_variance_usd = planned_amount_usd - allocated_amount_usd;
      const allocation_percentage =
        planned_amount_usd > 0
          ? (allocated_amount_usd / planned_amount_usd) * 100
          : 0;
      const unutilized_amount_usd = allocated_amount_usd - invoiced_amount_usd;
      const utilization_percentage =
        allocated_amount_usd > 0
          ? (invoiced_amount_usd / allocated_amount_usd) * 100
          : 0;

      return {
        ...budget,
        planned_amount_usd,
        allocated_amount_usd: Number(allocated_amount_usd.toFixed(2)),
        invoiced_amount_usd: Number(invoiced_amount_usd.toFixed(2)),
        allocated_variance_usd: Number(allocated_variance_usd.toFixed(2)),
        allocation_percentage: Number(allocation_percentage.toFixed(2)),
        unutilized_amount_usd: Number(unutilized_amount_usd.toFixed(2)),
        utilization_percentage: Number(utilization_percentage.toFixed(2)),
      };
    });

    // Stats summary
    const statistics = {
      total: allBudgets.length,
      active: allBudgets.filter((b) => b.status === true).length,
      inactive: allBudgets.filter((b) => b.status === false).length,
    };

    return NextResponse.json(
      success(
        {
          items: enrichedItems,
          total: allBudgets.length,
          page,
          pageSize,
          statistics,
        },
        "Budgets retrieved successfully"
      ),
      { status: 200 }
    );
  } catch (e) {
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
    !body.planned_amount ||
    !body.exchange_rate_usd
  ) {
    return NextResponse.json(error("Invalid data", 400), { status: 400 });
  }

  // const planned_amount_usd = body.planned_amount / body.exchange_rate_usd;
  const { planned_amount_usd, ...payload } = body;
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
