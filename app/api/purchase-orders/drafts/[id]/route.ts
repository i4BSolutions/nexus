import { createClient } from "@/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { ApiResponse } from "@/types/shared/api-response-type";
import { PurchaseOrderDraftInterface } from "@/types/purchase-order/purchase-order-draft.type";

/**
 * GET - Retrieve a specific draft
 * PUT - Update a draft
 * DELETE - Delete a draft
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<
  NextResponse<ApiResponse<PurchaseOrderDraftInterface> | ApiResponse<null>>
> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(error("Unauthorized"), { status: 401 });
  }

  const { id: idStr } = await context.params;

  const { data: draft, error: draftError } = await supabase
    .from("purchase_order_drafts")
    .select("*")
    .eq("id", idStr)
    .eq("user_id", user.id)
    .single();

  if (draftError) {
    return NextResponse.json(error("Draft not found"), { status: 404 });
  }

  return NextResponse.json(success(draft, "Draft retrieved successfully"), {
    status: 200,
  });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<
  NextResponse<ApiResponse<PurchaseOrderDraftInterface> | ApiResponse<null>>
> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(error("Unauthorized"), { status: 401 });
  }

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

  const updateData = {
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

  const { id: idStr } = await context.params;

  const { data: draft, error: draftError } = await supabase
    .from("purchase_order_drafts")
    .update(updateData)
    .eq("id", idStr)
    .eq("user_id", user.id)
    .select()
    .single();

  if (draftError) {
    return NextResponse.json(error(draftError.message), { status: 500 });
  }

  return NextResponse.json(success(draft, "Draft updated successfully"), {
    status: 200,
  });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null> | ApiResponse<null>>> {
  const supabase = await createClient();

  const { id: idStr } = await context.params;

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(error("Unauthorized"), { status: 401 });
  }

  const { error: deleteError } = await supabase
    .from("purchase_order_drafts")
    .delete()
    .eq("id", idStr)
    .eq("user_id", user.id);

  if (deleteError) {
    return NextResponse.json(error(deleteError.message), { status: 500 });
  }

  return NextResponse.json(success(null, "Draft deleted successfully"), {
    status: 200,
  });
}
