import { getAuthenticatedUser } from "@/helper/getUser";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { error, success } from "@/lib/api-response";
import { ApiResponse } from "@/types/shared/api-response-type";

type InvoiceItem = {
  product_id: number;
  warehouse_id: number;
  quantity: number;
  invoice_line_item_id: number;
};

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<any>>> {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  const body = await req.json();

  const invoice_items: InvoiceItem[] = body.invoice_items;

  if (!Array.isArray(invoice_items) || invoice_items.length === 0) {
    return NextResponse.json(error("No invoice items provided", 400), {
      status: 400,
    });
  }

  const errors: any[] = [];

  // First pass: validation only
  for (const item of invoice_items) {
    const { product_id, warehouse_id, quantity, invoice_line_item_id } = item;

    if (!product_id || !warehouse_id || !quantity || !invoice_line_item_id) {
      errors.push({
        item,
        error: "Missing required fields",
      });
      continue;
    }

    // Check invoice line item
    const { data: lineItem, error: itemError } = await supabase
      .from("purchase_invoice_item")
      .select("quantity")
      .eq("id", invoice_line_item_id)
      .single();

    if (itemError || !lineItem) {
      errors.push({
        item,
        error: "Invoice line item not found",
      });
      continue;
    }

    const expectedQty = lineItem.quantity;

    // Check how much has already been stocked in
    const { data: stockInAgg } = await supabase
      .from("stock_transaction")
      .select("quantity")
      .eq("invoice_line_item_id", invoice_line_item_id)
      .eq("product_id", product_id);

    const alreadyStockedIn =
      stockInAgg?.reduce((acc, tx) => acc + tx.quantity, 0) || 0;
    const remainingQty = expectedQty - alreadyStockedIn;

    if (quantity > remainingQty) {
      errors.push({
        item,
        error: `Stock-in exceeds remaining quantity (${remainingQty})`,
      });
    }
  }

  // If any errors, abort
  if (errors.length > 0) {
    return NextResponse.json(
      error("Some items cannot be stocked in", 400, { errors }),
      { status: 400 }
    );
  }

  // Second pass: perform inventory updates and transaction logs
  const results: any[] = [];

  for (const item of invoice_items) {
    const { product_id, warehouse_id, quantity, invoice_line_item_id } = item;

    // Check if inventory record exists
    const { data: existing } = await supabase
      .from("inventory")
      .select("id, quantity")
      .eq("product_id", product_id)
      .eq("warehouse_id", warehouse_id)
      .single();

    if (existing) {
      const { error: updateError } = await supabase
        .from("inventory")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);

      if (updateError) {
        return NextResponse.json(error("Failed to update inventory", 500), {
          status: 500,
        });
      }
    } else {
      const { error: insertError } = await supabase
        .from("inventory")
        .insert([{ product_id, warehouse_id, quantity }]);

      if (insertError) {
        return NextResponse.json(error("Failed to insert inventory", 500), {
          status: 500,
        });
      }
    }

    // Log stock transaction
    const { error: logError } = await supabase
      .from("stock_transaction")
      .insert([
        {
          type: "IN",
          product_id,
          warehouse_id,
          quantity,
          invoice_line_item_id,
          user_id: user.id,
          note: "Stocked in from invoice line item",
        },
      ]);

    if (logError) {
      return NextResponse.json(error("Failed to log stock-in", 500), {
        status: 500,
      });
    }

    results.push({
      item,
      success: true,
      message: "Stock-in successful",
    });
  }

  // Get purchase_order_id from any invoice_line_item
  const { data: anyLineItem } = await supabase
    .from("purchase_invoice_item")
    .select("purchase_order_id")
    .eq("id", invoice_items[0].invoice_line_item_id)
    .single();

  if (!anyLineItem) {
    return NextResponse.json(error("Could not determine purchase order", 500), {
      status: 500,
    });
  }

  const purchase_order_id = anyLineItem.purchase_order_id;

  // Step 1: Fetch PO line items
  const { data: poItems, error: poError } = await supabase
    .from("purchase_order_items")
    .select("product_id, quantity")
    .eq("purchase_order_id", purchase_order_id);

  if (poError) {
    return NextResponse.json(error("Failed to fetch PO items", 500), {
      status: 500,
    });
  }

  // Step 2: Fetch all invoice items for this PO
  const { data: invoiceItems } = await supabase
    .from("purchase_invoice_item")
    .select("id, product_id, quantity")
    .eq("purchase_order_id", purchase_order_id);

  if (!invoiceItems) {
    return NextResponse.json(error("Failed to fetch invoice items", 500), {
      status: 500,
    });
  }

  // Step 3: Fetch all stock transactions for this PO
  const invoiceItemIds = invoiceItems.map((i) => i.id);
  const { data: stockIns } = await supabase
    .from("stock_transaction")
    .select("invoice_line_item_id, quantity")
    .in("invoice_line_item_id", invoiceItemIds);

  // Step 4: Map total PO, Invoice, and Stock-in quantities
  const poMap: Record<number, number> = {};
  poItems.forEach((item) => {
    poMap[item.product_id] = item.quantity;
  });

  const invoiceMap: Record<number, number> = {};
  invoiceItems.forEach((item) => {
    invoiceMap[item.product_id] =
      (invoiceMap[item.product_id] || 0) + item.quantity;
  });

  const stockInMap: Record<number, number> = {};
  if (stockIns) {
    stockIns.forEach((tx) => {
      const line = invoiceItems.find((i) => i.id === tx.invoice_line_item_id);
      if (line) {
        stockInMap[line.product_id] =
          (stockInMap[line.product_id] || 0) + tx.quantity;
      }
    });
  }

  // Step 5: Determine status
  let allFullyReceived = true;
  let anyStocked = false;

  for (const [productIdStr, poQty] of Object.entries(poMap)) {
    const productId = Number(productIdStr);
    const invoiceQty = invoiceMap[productId] || 0;
    const stockedQty = stockInMap[productId] || 0;

    if (stockedQty > 0) anyStocked = true;

    // All PO quantities must be invoiced AND received
    if (invoiceQty < poQty || stockedQty < invoiceQty) {
      allFullyReceived = false;
    }
  }

  const { data: latestStatus } = await supabase
    .from("purchase_order_smart_status")
    .select("status")
    .eq("purchase_order_id", purchase_order_id)
    .single();

  let smartStatus;

  if (latestStatus && latestStatus.status !== "Awaiting Delivery") {
    smartStatus = allFullyReceived
      ? "Closed"
      : anyStocked
      ? "Partially Received"
      : "Not Started";
  }

  const { error: updateStatusError } = await supabase
    .from("purchase_order_smart_status")
    .upsert(
      {
        purchase_order_id,
        status: smartStatus,
      },
      { onConflict: "purchase_order_id" }
    );

  if (updateStatusError) {
    return NextResponse.json(
      error(updateStatusError.message || "Failed to update PO status"),
      { status: 500 }
    );
  }

  return NextResponse.json(success(results, "Stock-in complete"), {
    status: 201,
  });
}
