import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { success, error } from "@/lib/api-response";
import { ApiResponse } from "@/types/api-response-type";
import { BudgetStatistics } from "@/types/budgets/budgets.type";

export async function GET(): Promise<
  NextResponse<ApiResponse<BudgetStatistics | null>>
> {
  const supabase = await createClient();

  try {
    const { data: budgets } = await supabase
      .from("budgets")
      .select("id, planned_amount_usd, status");

    const { data: allocations } = await supabase
      .from("budget_allocations")
      .select("budget_id, amount_usd");

    const { data: invoices } = await supabase
      .from("budget_invoices")
      .select("budget_id, amount_usd");

    let totalPlannedUSD = 0;
    let totalAllocatedUSD = 0;
    let totalInvoicedUSD = 0;
    let utilizationSum = 0;
    let campaignCount = 0;

    for (const budget of budgets || []) {
      const budgetId = budget.id;
      const planned = budget.planned_amount_usd || 0;

      const allocSum =
        allocations
          ?.filter((a) => a.budget_id === budgetId)
          .reduce((sum, a) => sum + (a.amount_usd || 0), 0) || 0;

      const invSum =
        invoices
          ?.filter((i) => i.budget_id === budgetId)
          .reduce((sum, i) => sum + (i.amount_usd || 0), 0) || 0;

      totalPlannedUSD += planned;
      totalAllocatedUSD += allocSum;
      totalInvoicedUSD += invSum;

      // Utilization per campaign
      const utilization = allocSum > 0 ? (invSum / allocSum) * 100 : 0;
      utilizationSum += utilization;
      campaignCount += 1;
    }

    const allocationPercentage =
      totalPlannedUSD > 0 ? (totalAllocatedUSD / totalPlannedUSD) * 100 : 0;

    const invoiceUtilizationPercentage =
      totalAllocatedUSD > 0 ? (totalInvoicedUSD / totalAllocatedUSD) * 100 : 0;

    const averageUtilization =
      campaignCount > 0 ? utilizationSum / campaignCount : 0;

    return NextResponse.json(
      success(
        {
          totalPlannedUSD: Number(totalPlannedUSD.toFixed(2)),
          totalAllocatedUSD: Number(totalAllocatedUSD.toFixed(2)),
          totalInvoicedUSD: Number(totalInvoicedUSD.toFixed(2)),
          allocationPercentage: Number(allocationPercentage.toFixed(2)),
          invoiceUtilizationPercentage: Number(
            invoiceUtilizationPercentage.toFixed(2)
          ),
          averageUtilization: Number(averageUtilization.toFixed(2)),
        },
        "Budget statistics retrieved successfully"
      ),
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(error("Failed to calculate statistics", 500), {
      status: 500,
    });
  }
}
