import { createClient } from "@/lib/supabase/server";

import { NextRequest, NextResponse } from "next/server";

import { error, success } from "@/lib/api-response";

export async function PUT(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await context.params;

  const { error: statusError } = await supabase
    .from("purchase_order_smart_status")
    .update({ status: "Cancel" })
    .eq("purchase_order_id", id);

  if (statusError) {
    return NextResponse.json(error(statusError.message), {
      status: 500,
    });
  }

  return NextResponse.json(
    success(null, "Purchase order item deleted successfully"),
    { status: 200 }
  );
}
