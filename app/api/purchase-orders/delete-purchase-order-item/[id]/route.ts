import { createClient } from "@/lib/supabase/server";

import { NextRequest, NextResponse } from "next/server";

import { error, success } from "@/lib/api-response";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await context.params;

  const { error: purchaseOrderItemError } = await supabase
    .from("purchase_order_items")
    .delete()
    .eq("id", id);

  if (purchaseOrderItemError) {
    return NextResponse.json(error(purchaseOrderItemError.message), {
      status: 500,
    });
  }

  return NextResponse.json(
    success(null, "Purchase order item deleted successfully"),
    { status: 200 }
  );
}
