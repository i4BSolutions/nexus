import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { error, success } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/helper/getUser";
import { uploadTransferEvidenceImage } from "@/utils/uploadTransferEvidence";
import {
  BudgetAllocationsInterface,
  BudgetAllocationsUpdateData,
} from "@/types/budget-allocations/budget-allocations.type";
import { ApiResponse } from "@/types/shared/api-response-type";

const bucket = "allocation-transfer-evidence";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<BudgetAllocationsInterface | null>>> {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  if (!id) {
    return NextResponse.json(error("Invalid allocation ID", 400), {
      status: 400,
    });
  }

  const supabase = await createClient();

  const { data, error: dbError } = await supabase
    .from("budget_allocation")
    .select("*")
    .eq("id", id)
    .single();

  if (dbError || !data) {
    return NextResponse.json(error("Allocation not found", 404), {
      status: 404,
    });
  }

  return NextResponse.json(success(data, "Allocation retrieved successfully"), {
    status: 200,
  });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<BudgetAllocationsInterface | null>>> {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  if (!id) {
    return NextResponse.json(error("Invalid allocation ID", 400), {
      status: 400,
    });
  }

  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const formData = await req.formData();

  const allocation_number = String(formData.get("allocation_number") ?? "");
  const allocation_date = String(formData.get("allocation_date") ?? "");
  const allocation_amount = Number(formData.get("allocation_amount"));
  const currency_code = String(formData.get("currency_code") ?? "");
  const exchange_rate_usd = Number(formData.get("exchange_rate_usd"));
  const file = formData.get("file") as File | null;

  const { data: old } = await supabase
    .from("budget_allocation")
    .select("*")
    .eq("id", id)
    .single();

  let updateData: BudgetAllocationsUpdateData = {
    allocation_number,
    allocation_date,
    allocation_amount,
    currency_code,
    exchange_rate_usd,
  };

  if (file) {
    const uploadResult = await uploadTransferEvidenceImage(bucket, id, file);
    if (!uploadResult.success) {
      return NextResponse.json(
        error(uploadResult.error ?? "Unknown upload error", 400)
      );
    }
    updateData.transfer_evidence = uploadResult.filePath;
  }

  const { data: updated, error: dbError } = await supabase
    .from("budget_allocation")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json(error("Failed to update allocation", 500), {
      status: 500,
    });
  }

  await supabase.from("budget_allocation_activity_logs").insert([
    {
      user_id: user.id,
      role: user.role,
      action_type: "Update",
      po_id: updated.po_id,
      allocation_id: updated.id,
      amount: updated.allocation_amount,
      currency_code: updated.currency_code,
      notes: "Allocation updated via API",
    },
  ]);

  return NextResponse.json(
    success(updated, "Allocation updated successfully"),
    { status: 200 }
  );
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  if (!id) {
    return NextResponse.json(error("Invalid allocation ID", 400), {
      status: 400,
    });
  }

  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  const { data: old } = await supabase
    .from("budget_allocation")
    .select("*")
    .eq("id", id)
    .single();

  const { data: updated, error: dbError } = await supabase
    .from("budget_allocation")
    .update({ status: "Canceled" })
    .eq("id", id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json(error("Failed to cancel allocation", 500), {
      status: 500,
    });
  }

  await supabase.from("budget_allocation_activity_logs").insert([
    {
      user_id: user.id,
      role: user.role,
      action_type: "Cancel",
      po_id: updated.po_id,
      allocation_id: updated.id,
      amount: updated.allocation_amount,
      currency_code: updated.currency_code,
      notes: "Allocation canceled via API",
    },
  ]);

  return NextResponse.json(success(updated, "Allocation set to Canceled"), {
    status: 200,
  });
}
