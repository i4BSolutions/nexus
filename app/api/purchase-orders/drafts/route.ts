import { createClient } from "@/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { PurchaseOrderDraftInterface } from "@/types/purchase-order/purchase-order-draft.type";

import { getAuthenticatedUser } from "@/helper/getUser";
import { ApiResponse } from "@/types/shared/api-response-type";

/**
 * GET - Retrieve user's purchase order drafts
 * POST - Save a new purchase order draft
 */
export async function GET(
  req: NextRequest
): Promise<
  NextResponse<ApiResponse<PurchaseOrderDraftInterface[]> | ApiResponse<null>>
> {
  const supabase = await createClient();

  // Get current user
  const user = await getAuthenticatedUser(supabase);

  const { data: drafts, error: draftsError } = await supabase
    .from("purchase_order_drafts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (draftsError) {
    return NextResponse.json(error(draftsError.message), { status: 500 });
  }

  return NextResponse.json(
    success(drafts || [], "Drafts retrieved successfully"),
    { status: 200 }
  );
}

export async function POST(
  req: NextRequest
): Promise<
  NextResponse<ApiResponse<PurchaseOrderDraftInterface> | ApiResponse<null>>
> {
  const supabase = await createClient();

  // Get current user
  const user = await getAuthenticatedUser(supabase);

  const body = await req.json();
  const {
    po_number,
    supplier_id,
    region_id,
    budget_id,
    order_date,
    currency_id,
    usd_exchange_rate,
    contact_person_id,
    sign_person_id,
    authorized_signer_id,
    expected_delivery_date,
    note,
    form_data,
    current_step,
  } = body;

  const draftData = {
    user_id: user.id,
    po_number,
    supplier_id,
    region_id,
    budget_id,
    order_date,
    currency_id,
    usd_exchange_rate,
    contact_person_id,
    sign_person_id,
    authorized_signer_id,
    expected_delivery_date,
    note,
    form_data: form_data || {},
    current_step: current_step || 0,
    updated_at: new Date().toISOString(),
  };

  // 1. Check for existing draft with same po_number and user_id
  const { data: existingDraft, error: selectError } = await supabase
    .from("purchase_order_drafts")
    .select("*")
    .eq("user_id", user.id)
    .eq("po_number", po_number)
    .single();

  let result, resultError;

  if (existingDraft) {
    // 2. Update existing draft
    ({ data: result, error: resultError } = await supabase
      .from("purchase_order_drafts")
      .update(draftData)
      .eq("id", existingDraft.id)
      .select()
      .single());
  } else {
    // 3. Insert new draft
    ({ data: result, error: resultError } = await supabase
      .from("purchase_order_drafts")
      .insert(draftData)
      .select()
      .single());
  }

  if (resultError) {
    return NextResponse.json(error(resultError.message), { status: 500 });
  }

  return NextResponse.json(success(result, "Draft saved successfully"), {
    status: 200,
  });
}
