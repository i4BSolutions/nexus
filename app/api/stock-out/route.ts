// File: /app/api/stock-out/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { error, success } from "@/lib/api-response";
import { ApiResponse } from "@/types/shared/api-response-type";

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<null>>> {
  const supabase = await createClient();
  const body = await req.json();

  const {
    product_id,
    warehouse_id,
    quantity,
    reason,
    destination_warehouse_id,
    invoice_id,
    note,
  } = body;

  // Validate inputs
  if (!product_id || !warehouse_id || !quantity || !reason) {
    return NextResponse.json(error("Missing required fields", 400), {
      status: 400,
    });
  }

  if (quantity < 1) {
    return NextResponse.json(error("Minimum quantity is 1", 400), {
      status: 400,
    });
  }

  // Ensure stock is available
  const { data: stockRow, error: stockError } = await supabase
    .from("inventory")
    .select("id, quantity")
    .eq("product_id", product_id)
    .eq("warehouse_id", warehouse_id)
    .single();

  if (!stockRow || stockRow.quantity < quantity) {
    return NextResponse.json(error("Insufficient stock", 400), {
      status: 400,
    });
  }

  // Reduce stock from source
  const { error: updateError } = await supabase
    .from("inventory")
    .update({ quantity: stockRow.quantity - quantity })
    .eq("id", stockRow.id);

  if (updateError) {
    return NextResponse.json(error("Failed to update inventory", 500), {
      status: 500,
    });
  }

  // Insert stock transaction (type: OUT)
  const { error: txError } = await supabase.from("stock_transaction").insert([
    {
      product_id,
      warehouse_id,
      quantity,
      type: "OUT",
      reason,
      invoice_id,
      destination_warehouse_id:
        reason === "Warehouse Transfer" ? destination_warehouse_id : null,
      note,
    },
  ]);

  console.log(txError?.message);

  if (txError) {
    return NextResponse.json(error("Failed to log stock-out", 500), {
      status: 500,
    });
  }

  return NextResponse.json(success(null, "Stock-out completed"), {
    status: 201,
  });
}
