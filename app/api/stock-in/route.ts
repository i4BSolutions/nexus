import { getAuthenticatedUser } from "@/helper/getUser";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { error, success } from "@/lib/api-response";
import { v4 as uuidv4 } from "uuid";
import { hashFile } from "@/utils/hash";
import { ApiResponse } from "@/types/shared/api-response-type";

type InvoiceItem = {
  product_id: number;
  warehouse_id: number;
  quantity: number;
  invoice_line_item_id: number;
};

// export async function POST(
//   req: NextRequest
// ): Promise<NextResponse<ApiResponse<any>>> {
//   const supabase = await createClient();
//   const user = await getAuthenticatedUser(supabase);

//   const form = await req.formData();

//   const itemsRaw = form.get("invoice_items");

//   if (!itemsRaw || typeof itemsRaw !== "string") {
//     return NextResponse.json(error("No invoice items provided", 400), {
//       status: 400,
//     });
//   }
//   const invoice_items: InvoiceItem[] = JSON.parse(itemsRaw);
//   const evidenceFiles = form.getAll("evidence_photo").filter(Boolean) as File[];

//   if (evidenceFiles.length === 0) {
//     return NextResponse.json(error("Evidence photo is required.", 400), {
//       status: 400,
//     });
//   }

//   if (!Array.isArray(invoice_items) || invoice_items.length === 0) {
//     return NextResponse.json(error("No invoice items provided", 400), {
//       status: 400,
//     });
//   }

//   const errors: any[] = [];

//   // First pass: validation only
//   for (const item of invoice_items) {
//     const { product_id, warehouse_id, quantity, invoice_line_item_id } = item;

//     if (!product_id || !warehouse_id || !quantity || !invoice_line_item_id) {
//       errors.push({
//         item,
//         error: "Missing required fields",
//       });
//       continue;
//     }

//     // Check invoice line item
//     const { data: lineItem, error: itemError } = await supabase
//       .from("purchase_invoice_item")
//       .select("quantity, purchase_invoice_id")
//       .eq("id", invoice_line_item_id)
//       .single();

//     if (itemError || !lineItem) {
//       errors.push({
//         item,
//         error: "Invoice line item not found",
//       });
//       continue;
//     }

//     // Check if the related purchase invoice is voided
//     const { data: invoiceData, error: invoiceError } = await supabase
//       .from("purchase_invoice")
//       .select("is_voided")
//       .eq("id", lineItem.purchase_invoice_id)
//       .single();

//     if (invoiceError) {
//       errors.push({
//         item,
//         error: "Failed to check invoice status",
//       });
//       continue;
//     }

//     if (invoiceData?.is_voided) {
//       errors.push({
//         item,
//         error: "Cannot stock in items from a voided invoice",
//       });
//       continue;
//     }

//     const expectedQty = lineItem.quantity;

//     // Check how much has already been stocked in
//     const { data: stockInAgg } = await supabase
//       .from("stock_transaction")
//       .select("quantity")
//       .eq("invoice_line_item_id", invoice_line_item_id)
//       .eq("product_id", product_id);

//     const alreadyStockedIn =
//       stockInAgg?.reduce((acc, tx) => acc + tx.quantity, 0) || 0;
//     const remainingQty = expectedQty - alreadyStockedIn;

//     if (quantity > remainingQty) {
//       errors.push({
//         item,
//         error: `Stock-in exceeds remaining quantity (${remainingQty})`,
//       });
//     }
//   }

//   // If any errors, abort
//   if (errors.length > 0) {
//     return NextResponse.json(
//       error("Some items cannot be stocked in", 400, { errors }),
//       { status: 400 }
//     );
//   }

//   // Second pass: perform inventory updates and transaction logs
//   const results: any[] = [];
//   let firstStockInId: number | null = null;

//   for (const item of invoice_items) {
//     const { product_id, warehouse_id, quantity, invoice_line_item_id } = item;

//     // Check if inventory record exists
//     const { data: existing } = await supabase
//       .from("inventory")
//       .select("id, quantity")
//       .eq("product_id", product_id)
//       .eq("warehouse_id", warehouse_id)
//       .single();

//     if (existing) {
//       const { error: updateError } = await supabase
//         .from("inventory")
//         .update({ quantity: existing.quantity + quantity })
//         .eq("id", existing.id);

//       if (updateError) {
//         return NextResponse.json(error("Failed to update inventory", 500), {
//           status: 500,
//         });
//       }
//     } else {
//       const { error: insertError } = await supabase
//         .from("inventory")
//         .insert([{ product_id, warehouse_id, quantity }]);

//       if (insertError) {
//         return NextResponse.json(error("Failed to insert inventory", 500), {
//           status: 500,
//         });
//       }
//     }

//     // Log stock transaction
//     const { data: tx, error: logError } = await supabase
//       .from("stock_transaction")
//       .insert([
//         {
//           type: "IN",
//           product_id,
//           warehouse_id,
//           quantity,
//           invoice_line_item_id,
//           user_id: user.id,
//           note: "Stocked in from invoice line item",
//         },
//       ])
//       .select("id")
//       .single();

//     if (logError || !tx) {
//       return NextResponse.json(error("Failed to log stock-in", 500), {
//         status: 500,
//       });
//     }

//     if (firstStockInId == null) {
//       firstStockInId = Number(tx.id);
//     }

//     results.push({
//       item,
//       success: true,
//       message: "Stock-in successful",
//     });
//   }

//   // Save evidence
//   const stockInId = Number(firstStockInId);
//   for (const file of evidenceFiles) {
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
//     const hash = await hashFile(buffer);

//     const ext = (file.name?.split(".").pop() || "jpg").toLowerCase();
//     const fileKey = `stock-in-evidence/${stockInId}/${uuidv4()}.${ext}`;

//     const { error: uploadError } = await supabase.storage
//       .from(bucket)
//       .upload(fileKey, buffer, { contentType: file.type, upsert: false });

//     if (uploadError) {
//       return NextResponse.json(
//         error(`Upload failed: ${uploadError.message}`, 500),
//         { status: 500 }
//       );
//     }

//     const { data: publicUrlData } = supabase.storage
//       .from(bucket)
//       .getPublicUrl(fileKey);

//     await supabase.from("stock_in_evidence").insert({
//       stock_in_id: stockInId,
//       file_url: publicUrlData.publicUrl,
//       file_key: fileKey,
//       mime_type: file.type,
//       size_bytes: file.size,
//       hash_sha256: hash,
//       uploader_user_id: user.id,
//     });
//   }

//   // Get purchase_order_id from any invoice_line_item
//   const { data: anyLineItem } = await supabase
//     .from("purchase_invoice_item")
//     .select("purchase_order_id")
//     .eq("id", invoice_items[0].invoice_line_item_id)
//     .single();

//   if (!anyLineItem) {
//     return NextResponse.json(error("Could not determine purchase order", 500), {
//       status: 500,
//     });
//   }

//   const purchase_order_id = anyLineItem.purchase_order_id;

//   // Check if the related purchase order is cancelled
//   const { data: currentSmartStatus, error: smartStatusError } = await supabase
//     .from("purchase_order_smart_status")
//     .select("status")
//     .eq("purchase_order_id", purchase_order_id)
//     .single();

//   if (smartStatusError) {
//     return NextResponse.json(
//       error("Failed to check purchase order status", 500),
//       { status: 500 }
//     );
//   }

//   if (currentSmartStatus?.status === "Cancel") {
//     return NextResponse.json(
//       error("Cannot stock in items for a cancelled purchase order", 400),
//       { status: 400 }
//     );
//   }

//   // Step 1: Fetch PO line items
//   const { data: poItems, error: poError } = await supabase
//     .from("purchase_order_items")
//     .select("product_id, quantity")
//     .eq("purchase_order_id", purchase_order_id);

//   if (poError) {
//     return NextResponse.json(error("Failed to fetch PO items", 500), {
//       status: 500,
//     });
//   }

//   // Step 2: Fetch all invoice items for this PO
//   const { data: invoiceItems } = await supabase
//     .from("purchase_invoice_item")
//     .select("id, product_id, quantity")
//     .eq("purchase_order_id", purchase_order_id);

//   if (!invoiceItems) {
//     return NextResponse.json(error("Failed to fetch invoice items", 500), {
//       status: 500,
//     });
//   }

//   // Step 3: Fetch all stock transactions for this PO
//   const invoiceItemIds = invoiceItems.map((i) => i.id);
//   const { data: stockIns } = await supabase
//     .from("stock_transaction")
//     .select("invoice_line_item_id, quantity")
//     .in("invoice_line_item_id", invoiceItemIds);

//   // Step 4: Map total PO, Invoice, and Stock-in quantities
//   const poMap: Record<number, number> = {};
//   poItems.forEach((item) => {
//     poMap[item.product_id] = item.quantity;
//   });

//   const invoiceMap: Record<number, number> = {};
//   invoiceItems.forEach((item) => {
//     invoiceMap[item.product_id] =
//       (invoiceMap[item.product_id] || 0) + item.quantity;
//   });

//   const stockInMap: Record<number, number> = {};
//   if (stockIns) {
//     stockIns.forEach((tx) => {
//       const line = invoiceItems.find((i) => i.id === tx.invoice_line_item_id);
//       if (line) {
//         stockInMap[line.product_id] =
//           (stockInMap[line.product_id] || 0) + tx.quantity;
//       }
//     });
//   }

//   // Step 5: Determine status
//   let allFullyReceived = true;
//   let anyStocked = false;

//   for (const [productIdStr, poQty] of Object.entries(poMap)) {
//     const productId = Number(productIdStr);
//     const invoiceQty = invoiceMap[productId] || 0;
//     const stockedQty = stockInMap[productId] || 0;

//     if (stockedQty > 0) anyStocked = true;

//     // All PO quantities must be invoiced AND received
//     if (invoiceQty < poQty || stockedQty < invoiceQty) {
//       allFullyReceived = false;
//     }
//   }

//   const { data: latestStatus } = await supabase
//     .from("purchase_order_smart_status")
//     .select("status")
//     .eq("purchase_order_id", purchase_order_id)
//     .single();

//   let smartStatus;

//   console.log("Determining smart status...");
//   console.log("All fully received:", allFullyReceived);
//   console.log("Any stocked in:", anyStocked);
//   console.log("Latest status:", latestStatus?.status);

//   if (latestStatus) {
//     smartStatus = allFullyReceived
//       ? "Closed"
//       : anyStocked && latestStatus.status === "Awaiting Delivery"
//       ? "Partially Received"
//       : "Partially Invoiced";
//   }

//   console.log("Smart status determined:", smartStatus);

//   const { error: updateStatusError } = await supabase
//     .from("purchase_order_smart_status")
//     .upsert(
//       {
//         purchase_order_id,
//         status: smartStatus,
//       },
//       { onConflict: "purchase_order_id" }
//     );

//   if (updateStatusError) {
//     return NextResponse.json(
//       error(updateStatusError.message || "Failed to update PO status"),
//       { status: 500 }
//     );
//   }

//   return NextResponse.json(success(results, "Stock-in complete"), {
//     status: 201,
//   });
// }

const BUCKET = "core-orbit";

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<any>>> {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  const form = await req.formData();

  const itemsRaw = form.get("invoice_items");
  if (!itemsRaw || typeof itemsRaw !== "string") {
    return NextResponse.json(error("No invoice items provided", 400), {
      status: 400,
    });
  }

  const invoice_items: InvoiceItem[] = JSON.parse(itemsRaw);

  // ⚠️ Expect files grouped per line item:
  // e.g. formData.append(`evidence_${lineItemId}`, file)
  // so we can match files to the right invoice item
  const results: any[] = [];

  for (const item of invoice_items) {
    const { product_id, warehouse_id, quantity, invoice_line_item_id } = item;

    // 1. Insert stock_transaction
    const { data: tx, error: txError } = await supabase
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
      ])
      .select("id")
      .single();

    if (txError || !tx) {
      return NextResponse.json(error("Failed to log stock-in", 500), {
        status: 500,
      });
    }

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
    } else {
      const { error: insertError } = await supabase
        .from("inventory")
        .insert([{ product_id, warehouse_id, quantity }]);
    }
    //     }

    // 2. Pull only this line’s files from the FormData
    const evidenceFiles = form.getAll(
      `evidence_${invoice_line_item_id}`
    ) as File[];

    for (const file of evidenceFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const hash = await hashFile(buffer);

      const ext = (file.name?.split(".").pop() || "jpg").toLowerCase();
      const fileKey = `stock-in-evidence/${tx.id}/${uuidv4()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileKey, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          error(`Upload failed: ${uploadError.message}`, 500),
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileKey);

      await supabase.from("stock_in_evidence").insert({
        stock_in_id: tx.id,
        file_url: publicUrlData.publicUrl,
        file_key: fileKey,
        mime_type: file.type,
        size_bytes: file.size,
        hash_sha256: hash,
        uploader_user_id: user.id,
      });
    }

    results.push({ item, txId: tx.id, success: true });
  }

  return NextResponse.json(success(results, "Stock-in complete"), {
    status: 201,
  });
}
