import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/helper/getUser";
import { error, success } from "@/lib/api-response";
import {
  BudgetAllocationsInterface,
  BudgetAllocationsResponse,
} from "@/types/budget-allocations/budget-allocations.type";
import { uploadTransferEvidenceImage } from "@/utils/uploadTransferEvidence";
import { ApiResponse } from "@/types/shared/api-response-type";

const bucket = "core-orbit";

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<BudgetAllocationsResponse | null>>> {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const status = searchParams.get("status") || undefined;
  const sortParam = searchParams.get("sort"); // e.g. allocation_amount_desc
  const q = searchParams.get("q") || ""; // search term for allocation_number

  let query = supabase
    .from("budget_allocation")
    .select("*", { count: "exact" });

  // Search by allocation_number
  if (q) {
    query = query.ilike("allocation_number", `%${q}%`);
  }

  // Filter by status
  if (status) {
    query = query.eq("status", status);
  }

  // Sort
  if (sortParam === "allocation_amount_asc") {
    query = query.order("allocation_amount", { ascending: true });
  } else if (sortParam === "allocation_amount_desc") {
    query = query.order("allocation_amount", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false }); // default
  }

  // Pagination
  query = query.range(from, to);

  const { data, count, error: getError } = await query;

  if (getError) {
    return NextResponse.json(error(getError.message), { status: 500 });
  }

  const allocations = data || [];

  // Statistics
  const totalAllocations = count || 0;
  const totalAllocatedUSD = allocations.reduce(
    (sum, item) => sum + (item.equivalent_usd || 0),
    0
  );
  const totalPendingUSD = allocations
    .filter((item) => item.status === "Pending")
    .reduce((sum, item) => sum + (item.equivalent_usd || 0), 0);

  const responseData: BudgetAllocationsResponse = {
    items: allocations,
    total: totalAllocations,
    page,
    pageSize,
    statistics: {
      totalAllocations,
      totalAllocatedUSD,
      totalPendingUSD,
    },
  };

  return NextResponse.json(
    success(responseData, "Budget allocations retrieved successfully")
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
      role: user.name,
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
