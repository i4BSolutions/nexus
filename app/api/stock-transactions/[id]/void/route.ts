import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { success, error } from "@/lib/api-response";
import { ApiResponse } from "@/types/shared/api-response-type";

type TxType = "IN" | "OUT";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  const supabase = await createClient();
  const { id } = await context.params;

  if (!id || Number.isNaN(id)) {
    return NextResponse.json(error("Invalid transaction ID", 400), {
      status: 400,
    });
  }

  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id || null;
  if (!userId)
    return NextResponse.json(error("Unauthorized", 401), { status: 401 });

  const body = await req.json().catch(() => ({}));
  const reason: string | null =
    typeof body?.reason === "string" && body.reason.trim()
      ? body.reason.trim()
      : null;
  if (!reason)
    return NextResponse.json(error("Reason is required", 400), { status: 400 });

  // 1) Load the transaction row
  const { data: tx, error: txErr } = await supabase
    .from("stock_transaction")
    .select("id, product_id, warehouse_id, quantity, type, is_voided")
    .eq("id", id)
    .maybeSingle();

  if (txErr || !tx)
    return NextResponse.json(error("Transaction not found", 404), {
      status: 404,
    });
  if (tx.is_voided) {
    return NextResponse.json(error("Transaction already voided", 409), {
      status: 409,
    });
  }

  const qty = Number(tx.quantity) || 0;
  const adj = (tx.type as TxType) === "IN" ? -qty : +qty; // remove the effect of the original tx
  const productId = tx.product_id as number;
  const warehouseId = tx.warehouse_id as number;

  // 2) Record void reason first (will be cleaned up if anything fails)
  const { data: voidRow, error: voidErr } = await supabase
    .from("stock_transaction_void_reason")
    .insert({
      stock_transaction_id: id,
      reason,
      voided_by: userId,
    })
    .select("id")
    .single();
  if (voidErr || !voidRow) {
    return NextResponse.json(error("Failed to record void reason", 500), {
      status: 500,
    });
  }

  // 3) Adjust inventory for (product_id, warehouse_id)
  //    Guard against negative stock.
  const { data: invRow, error: invFetchErr } = await supabase
    .from("inventory")
    .select("id, quantity")
    .eq("product_id", productId)
    .eq("warehouse_id", warehouseId)
    .maybeSingle();

  if (invFetchErr) {
    // cleanup reason row
    await supabase
      .from("stock_transaction_void_reason")
      .delete()
      .eq("id", voidRow.id);
    return NextResponse.json(error("Failed to read inventory", 500), {
      status: 500,
    });
  }

  let oldInvQty = 0;
  let newInvQty = 0;

  if (!invRow) {
    // No row yet for this (product, warehouse)
    if (adj < 0) {
      // would go negative → reject
      await supabase
        .from("stock_transaction_void_reason")
        .delete()
        .eq("id", voidRow.id);
      return NextResponse.json(
        error(
          "Voiding would make inventory negative. Operation cancelled.",
          409
        ),
        { status: 409 }
      );
    }
    oldInvQty = 0;
    newInvQty = adj;

    const { error: invInsertErr } = await supabase.from("inventory").insert({
      product_id: productId,
      warehouse_id: warehouseId,
      quantity: newInvQty,
    });
    if (invInsertErr) {
      await supabase
        .from("stock_transaction_void_reason")
        .delete()
        .eq("id", voidRow.id);
      return NextResponse.json(error("Failed to create inventory row", 500), {
        status: 500,
      });
    }
  } else {
    oldInvQty = Number(invRow.quantity) || 0;
    newInvQty = oldInvQty + adj;
    if (newInvQty < 0) {
      await supabase
        .from("stock_transaction_void_reason")
        .delete()
        .eq("id", voidRow.id);
      return NextResponse.json(
        error(
          "Voiding would make inventory negative. Operation cancelled.",
          409
        ),
        { status: 409 }
      );
    }

    const { error: invUpdateErr } = await supabase
      .from("inventory")
      .update({ quantity: newInvQty })
      .eq("id", invRow.id);

    if (invUpdateErr) {
      await supabase
        .from("stock_transaction_void_reason")
        .delete()
        .eq("id", voidRow.id);
      return NextResponse.json(error("Failed to update inventory", 500), {
        status: 500,
      });
    }
  }

  // 4) Mark the transaction voided
  const { error: updErr } = await supabase
    .from("stock_transaction")
    .update({ is_voided: true })
    .eq("id", id);

  if (updErr) {
    if (!invRow) {
      await supabase
        .from("inventory")
        .delete()
        .eq("product_id", productId)
        .eq("warehouse_id", warehouseId);
    } else {
      await supabase
        .from("inventory")
        .update({ quantity: oldInvQty })
        .eq("id", invRow.id);
    }
    await supabase
      .from("stock_transaction_void_reason")
      .delete()
      .eq("id", voidRow.id);
    return NextResponse.json(error("Failed to void transaction", 500), {
      status: 500,
    });
  }

  // 5) Audit log (field + inventory change)
  const { error: auditError } = await supabase
    .from("stock_transaction_audit_log")
    .insert({
      transaction_id: id,
      changed_by: userId,
      changed_field: "void_and_inventory_adjustment",
      old_values: oldInvQty.toString(),
      new_values: newInvQty.toString(),
    });

  console.log(auditError);

  return NextResponse.json(
    success(null, "Transaction voided and inventory updated"),
    {
      status: 200,
    }
  );
}
