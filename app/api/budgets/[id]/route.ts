import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { Budget } from "@/types/budgets/budgets.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Budget | null>>> {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  if (!id) {
    return NextResponse.json(error("Invalid budget ID", 400), {
      status: 400,
    });
  }

  const supabase = await createClient();

  const { data, error: dbError } = await supabase
    .from("budgets")
    .select(
      `
      id,
      budget_name,
      project_name,
      description,
      start_date,
      end_date,
      currency_code,
      exchange_rate_usd,
      planned_amount,
      planned_amount_usd,
      status,
      created_by,
      created_at,
      updated_at
      `
    )
    .eq("id", id)
    .single();

  if (dbError || !data) {
    return NextResponse.json(error("Budget not found", 404), {
      status: 404,
    });
  }

  return NextResponse.json(success(data, "Budget retrieved successfully"), {
    status: 200,
  });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Budget | null>>> {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  if (!id) {
    return NextResponse.json(error("Invalid budget ID", 400), { status: 400 });
  }

  const supabase = await createClient();
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
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Budget | null>>> {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  if (!id) {
    return NextResponse.json(error("Invalid budget ID", 400), { status: 400 });
  }

  const supabase = await createClient();
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  const { data: old } = await supabase
    .from("budgets")
    .select("*")
    .eq("id", id)
    .single();

  if (!old) {
    return NextResponse.json(error("Budget not found", 404), { status: 404 });
  }

  const toggledStatus = !old.status;

  const { data: updated, error: dbError } = await supabase
    .from("budgets")
    .update({ status: toggledStatus })
    .eq("id", id)
    .select()
    .single();

  if (dbError)
    return NextResponse.json(error(dbError.message, 500), {
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
