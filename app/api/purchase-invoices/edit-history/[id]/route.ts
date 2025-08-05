import { success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { PurchaseInvoiceHistory } from "@/types/purchase-invoice/purchase-invoice.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<PurchaseInvoiceHistory[]> | any>> {
  const supabase = await createClient();
  const { id } = await context.params;

  // 1. Fetch audit logs
  const { data: auditLogs, error: auditError } = await supabase
    .from("pruchase_invoice_audit_log")
    .select("*, user_profiles(full_name)")
    .eq("purchase_invoice_id", id)
    .order("changed_at", { ascending: true });

  if (auditError) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch audit logs",
        error: auditError,
      },
      { status: 500 }
    );
  }

  // 2. Fetch update reasons
  const { data: reasons, error: reasonError } = await supabase
    .from("purchase_invoice_update_reason")
    .select("*")
    .eq("purchase_invoice_id", id)
    .order("created_at", { ascending: true });

  if (reasonError) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch update reasons",
        error: reasonError,
      },
      { status: 500 }
    );
  }

  // 3. Merge: find the latest reason (by created_at) before each auditLog's changed_at
  const mergedLogs = auditLogs.map((log) => {
    const logTime = new Date(log.changed_at).getTime();

    const matchingReason = [...reasons]
      .filter((r) => new Date(r.created_at).getTime() <= logTime)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]; // Latest before or equal

    log.changed_by = log.user_profiles.full_name;

    return {
      ...log,
      reason: matchingReason?.reason ?? null,
      reason_created_at: matchingReason?.created_at ?? null,
    };
  });

  return NextResponse.json(
    success(mergedLogs, "Purchase invoice edit history retrieved successfully"),
    { status: 200 }
  );
}
