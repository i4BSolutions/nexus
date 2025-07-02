import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/api-response-type";
import { BudgetAuditLog } from "@/types/budgets/budgets.type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<BudgetAuditLog[] | null>>> {
  const supabase = await createClient();

  const { data, error: dbError } = await supabase
    .from("budget_audit_logs")
    .select(
      "id, budget_id, action, changes, ip_address, performed_by, created_at"
    )
    .eq("budget_id", params.id)
    .order("created_at", { ascending: false });

  if (dbError)
    return NextResponse.json(error("Failed to fetch audit logs", 500), {
      status: 500,
    });

  return NextResponse.json(success(data, "Audit logs retrieved successfully"), {
    status: 200,
  });
}
