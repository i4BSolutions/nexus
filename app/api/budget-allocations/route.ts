import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/helper/getUser";
import { error, success } from "@/lib/api-response";
import { ApiResponse } from "@/types/api-response-type";
import {
  BudgetAllocationsInterface,
  BudgetAllocationsResponse,
} from "@/types/budget-allocations/budget-allocations.type";
import { uploadTransferEvidenceImage } from "@/utils/uploadTransferEvidence";

const bucket = "core-orbit";

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<BudgetAllocationsResponse | null>>> {
  const supabase = await createClient();
  const searchParams = req.nextUrl.searchParams;

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const poId = searchParams.get("po_id");
  const budgetId = searchParams.get("budget_id");
  const status = searchParams.get("status");

  let query = supabase
    .from("budget_allocation")
    .select("*", { count: "exact" });

  if (poId) query = query.eq("po_id", poId);
  if (budgetId) query = query.eq("budget_id", budgetId);
  if (status) query = query.eq("status", status);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to);

  const { data, error: queryError, count } = await query;

  if (queryError) return NextResponse.json(error(queryError.message, 500));

  const signedData = await Promise.all(
    (data || []).map(async (item) => {
      if (item.transfer_evidence) {
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from(bucket)
            .createSignedUrl(item.transfer_evidence, 60 * 60); // 1 hour expiry

        if (signedUrlError) {
          console.error("Signed URL error:", signedUrlError.message);
        }

        return {
          ...item,
          transfer_evidence_url: signedUrlData?.signedUrl || null,
        };
      }

      return { ...item, transfer_evidence_url: null };
    })
  );

  return NextResponse.json(
    success({
      items: signedData || [],
      total: count || 0,
      page,
      pageSize,
    })
  );
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<BudgetAllocationsInterface | null>>> {
  const supabase = await createClient();
  const formData = await req.formData();
  const user = await getAuthenticatedUser(supabase);
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  const po_id = Number(formData.get("po_id"));
  const allocation_number = String(formData.get("allocation_number"));
  const allocation_date = String(formData.get("allocation_date"));
  const allocation_amount = Number(formData.get("allocation_amount"));
  const currency_code = String(formData.get("currency_code"));
  const exchange_rate_usd = Number(formData.get("exchange_rate_usd"));
  const file = formData.get("file") as File;

  const { data: po, error: poError } = await supabase
    .from("purchase_order")
    .select("budget_id")
    .eq("id", po_id)
    .maybeSingle();

  if (poError) return NextResponse.json(error(poError.message, 500));

  if (!po?.budget_id)
    return NextResponse.json(
      error("Invalid PO or missing budget linkage", 400)
    );

  const { data: inserted, error: insertError } = await supabase
    .from("budget_allocation")
    .insert([
      {
        po_id,
        budget_id: po.budget_id,
        allocation_number,
        allocation_date,
        allocation_amount,
        currency_code,
        exchange_rate_usd,
        transfer_evidence: "",
        status: "Pending",
        created_by: user.id,
      },
    ])
    .select()
    .single();

  if (insertError) return NextResponse.json(error(insertError.message, 500));

  const allocationId = inserted.id;

  // Upload file
  const uploadResult = await uploadTransferEvidenceImage(
    bucket,
    allocationId,
    file
  );

  if (!uploadResult.success)
    return NextResponse.json(
      error(uploadResult.error || "Upload image error", 400)
    );

  // Update allocation with file path
  const { data: updated, error: updateError } = await supabase
    .from("budget_allocation")
    .update({ transfer_evidence: uploadResult.filePath })
    .eq("id", allocationId)
    .select()
    .single();

  if (updateError) return NextResponse.json(error(updateError.message, 500));

  // Audit log
  await supabase.from("budget_allocation_activity_logs").insert([
    {
      user_id: user.id,
      role: user.role,
      action_type: "Create",
      po_id,
      allocation_id: allocationId,
      amount: allocation_amount,
      currency_code,
      notes: null,
    },
  ]);

  return NextResponse.json(
    success(updated, "Allocation created successfully"),
    {
      status: 201,
    }
  );
}
