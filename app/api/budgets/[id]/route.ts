import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/api-response-type";
import { Budget } from "@/types/budgets/budgets.type";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<Budget | null>>> {
  const supabase = await createClient();
  const id = params.id;
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const body = await req.json();
  const userId = body.updated_by || "system";

  const { data: old } = await supabase
    .from("budgets")
    .select("*")
    .eq("id", id)
    .single();

  const planned_amount_usd = body.planned_amount / body.exchange_rate_usd;
  const payload = { ...body, planned_amount_usd };

  const { data: updated, error: dbError } = await supabase
    .from("budgets")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (dbError)
    return NextResponse.json(error("Failed to update budget", 500), {
      status: 500,
    });

  const action = old.status !== updated.status ? "STATUS_CHANGE" : "UPDATE";

  await supabase.from("budget_audit_logs").insert([
    {
      budget_id: updated.id,
      action,
      changes: { before: old, after: updated },
      performed_by: userId,
      ip_address: ip,
    },
  ]);

  return NextResponse.json(success(updated, "Budget updated successfully"), {
    status: 200,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<Budget | null>>> {
  const supabase = await createClient();
  const id = params.id;
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  const { data: old } = await supabase
    .from("budgets")
    .select("*")
    .eq("id", id)
    .single();

  const { data: updated, error: dbError } = await supabase
    .from("budgets")
    .update({ status: "Inactive" })
    .eq("id", id)
    .select()
    .single();

  if (dbError)
    return NextResponse.json(error("Failed to delete (soft) budget", 500), {
      status: 500,
    });

  await supabase.from("budget_audit_logs").insert([
    {
      budget_id: updated.id,
      action: "STATUS_CHANGE",
      changes: { before: old, after: updated },
      performed_by: old.created_by,
      ip_address: ip,
    },
  ]);

  return NextResponse.json(success(updated, "Budget set to Inactive"), {
    status: 200,
  });
}
