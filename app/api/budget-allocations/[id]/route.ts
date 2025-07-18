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

const bucket = "core-orbit";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<BudgetAllocationsInterface | null>>> {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  if (!id || isNaN(id)) {
    return NextResponse.json(error("Invalid allocation ID", 400), {
      status: 400,
    });
  }

  const supabase = await createClient();

  // Fetch the allocation record
  const { data, error: fetchError } = await supabase
    .from("budget_allocation")
    .select("*")
    .eq("id", id)
    .single();

  console.log(fetchError?.message);

  if (fetchError) {
    return NextResponse.json(error(fetchError.message), { status: 500 });
  }

  if (!data) {
    return NextResponse.json(error("Budget allocation not found", 404));
  }

  // Handle multiple transfer evidence files
  const transferEvidencePaths: string[] = Array.isArray(data.transfer_evidence)
    ? data.transfer_evidence
    : typeof data.transfer_evidence === "string"
    ? [data.transfer_evidence]
    : [];

  // Generate signed URLs
  const { data: signedUrls, error: signedError } = await supabase.storage
    .from(bucket)
    .createSignedUrls(transferEvidencePaths, 60 * 60); // valid for 1 hour
  console.log(signedError?.message);
  if (signedError) {
    return NextResponse.json(error(signedError.message), { status: 500 });
  }

  const signedMap = new Map<string, string>();
  signedUrls?.forEach(
    (entry: { path: string | null; signedUrl: string | null }) => {
      if (entry.path && entry.signedUrl) {
        signedMap.set(entry.path, entry.signedUrl);
      }
    }
  );

  const transfer_evidence_urls = transferEvidencePaths.map((path: string) => ({
    key: path,
    url: signedMap.get(path) || null,
  }));

  const response: BudgetAllocationsInterface = {
    ...data,
    transfer_evidence_urls,
  };

  return NextResponse.json(success(response, "Allocation retrieved"), {
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

  const po_id = Number(formData.get("po_id"));
  const allocation_number = String(formData.get("allocation_number") ?? "");
  const allocation_date = String(formData.get("allocation_date") ?? "");
  const allocation_amount = Number(formData.get("allocation_amount"));
  const currency_code = String(formData.get("currency_code") ?? "");
  const exchange_rate_usd = Number(formData.get("exchange_rate_usd"));
  const note = String(formData.get("note") ?? "");
  const allocated_by = String(formData.get("allocated_by") ?? "");
  const files = formData.getAll("file") as File[];

  const { data: old, error: oldError } = await supabase
    .from("budget_allocation")
    .select("*")
    .eq("id", id)
    .single();

  if (oldError || !old) {
    return NextResponse.json(
      error(oldError?.message || "Allocation not found", 404)
    );
  }

  let existingEvidence: string[] = [];
  if (Array.isArray(old.transfer_evidence)) {
    existingEvidence = old.transfer_evidence;
  } else if (
    typeof old.transfer_evidence === "string" &&
    old.transfer_evidence
  ) {
    existingEvidence = [old.transfer_evidence];
  }

  // Upload new files if any
  const uploadedPaths: string[] = [];
  for (const file of files) {
    const uploadResult = await uploadTransferEvidenceImage(bucket, id, file);

    if (!uploadResult.success || !uploadResult.filePath) {
      return NextResponse.json(
        error(uploadResult.error ?? "File upload failed", 400)
      );
    }

    uploadedPaths.push(uploadResult.filePath);
  }

  const mergedEvidence = [...existingEvidence, ...uploadedPaths];

  const updateData: BudgetAllocationsUpdateData = {
    po_id,
    allocation_number,
    allocation_date,
    allocation_amount,
    currency_code,
    exchange_rate_usd,
    allocated_by,
    note,
    transfer_evidence: mergedEvidence,
  };

  // Update record
  const { data: updated, error: updateError } = await supabase
    .from("budget_allocation")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      error(updateError?.message ?? "Update failed", 500)
    );
  }

  // Audit log
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

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<BudgetAllocationsInterface | null>>> {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  if (!id) return NextResponse.json(error("Invalid allocation ID", 400));

  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  const body = await req.json();
  const status = body.status;

  if (!["Pending", "Approved", "Canceled"].includes(status)) {
    return NextResponse.json(error("Invalid status value", 400));
  }

  const { data: updated, error: dbError } = await supabase
    .from("budget_allocation")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (dbError || !updated) {
    return NextResponse.json(error("Failed to update status", 500));
  }

  await supabase.from("budget_allocation_activity_logs").insert([
    {
      user_id: user.id,
      role: user.role,
      action_type: status === "Canceled" ? "Cancel" : "Approve",
      po_id: updated.po_id,
      allocation_id: updated.id,
      amount: updated.allocation_amount,
      currency_code: updated.currency_code,
      notes: `Allocation ${status.toLowerCase()} via quick action`,
    },
  ]);

  return NextResponse.json(success(updated, "Status updated"), { status: 200 });
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

  // Fetch the budget allocation record
  const { data: old, error: oldError } = await supabase
    .from("budget_allocation")
    .select("*")
    .eq("id", id)
    .single();

  if (oldError || !old) {
    return NextResponse.json(
      error(oldError?.message || "Allocation not found", 404)
    );
  }

  // Remove files from storage (if they exist)
  const transferEvidencePaths: string[] = Array.isArray(old.transfer_evidence)
    ? old.transfer_evidence
    : typeof old.transfer_evidence === "string"
    ? [old.transfer_evidence]
    : [];

  const cleanedPaths = transferEvidencePaths.filter(
    (path): path is string => typeof path === "string" && path.trim().length > 0
  );

  if (cleanedPaths.length > 0) {
    const { error: removeError } = await supabase.storage
      .from(bucket)
      .remove(cleanedPaths); // Remove files from storage

    if (removeError) {
      return NextResponse.json(
        error(`Failed to remove transfer evidence`, 500),
        { status: 500 }
      );
    }
  }

  // Delete dependent activity logs first
  const { error: deleteLogError } = await supabase
    .from("budget_allocation_activity_logs")
    .delete()
    .eq("allocation_id", id);

  if (deleteLogError) {
    return NextResponse.json(error(deleteLogError.message, 500), {
      status: 500,
    });
  }

  // Perform the hard delete by deleting the budget allocation record
  const { data: deleted, error: dbError } = await supabase
    .from("budget_allocation")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (dbError || !deleted) {
    return NextResponse.json(
      error(dbError?.message || "Failed to delete allocation", 500),
      {
        status: 500,
      }
    );
  }

  // If allocation is deleted successfully, handle the activity log
  if (deleted) {
    const { po_id, allocation_amount, currency_code } =
      deleted as BudgetAllocationsInterface; // Assert the type

    // Insert the activity log for deletion
    await supabase.from("budget_allocation_activity_logs").insert([
      {
        user_id: user.id,
        role: user.role,
        action_type: "Delete",
        po_id: po_id, // Now we know this property exists on deleted
        allocation_id: deleted.id,
        amount: allocation_amount,
        currency_code: currency_code,
        notes: "Allocation deleted via API",
      },
    ]);
  }

  return NextResponse.json(success(null, "Allocation deleted successfully"), {
    status: 200,
  });
}
