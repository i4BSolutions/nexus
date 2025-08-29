import { getAuthenticatedUser } from "@/helper/getUser";
import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ProductInterface } from "@/types/product/product.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<ProductInterface | null>>> {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  const supabase = await createClient();

  if (!id) {
    return NextResponse.json(error("Invalid product ID", 400), {
      status: 400,
    });
  }

  const { data: product, error: dbError } = await supabase
    .from("product")
    .select("*, product_currency:currency_code_id(currency_code)")
    .eq("id", id)
    .single();

  if (dbError) {
    return NextResponse.json(error("Failed to retrieve product", 500), {
      status: 500,
    });
  }

  if (!product) {
    return NextResponse.json(error("Product not found", 404), {
      status: 404,
    });
  }

  const { data: stockInventory, error: inventoryError } = await supabase
    .from("inventory")
    .select("quantity")
    .eq("product_id", id);

  if (inventoryError) {
    return NextResponse.json(
      error(inventoryError.message || "Failed to fetch inventory", 500),
      { status: 500 }
    );
  }

  const current_stock =
    stockInventory?.reduce((sum, row) => sum + Number(row.quantity), 0) ?? 0;

  const result: ProductInterface = {
    ...product,
    current_stock,
  };

  return NextResponse.json(success(result, "Product retrieved successfully"), {
    status: 200,
  });
}

// --> Version 1 Product Audit Log
// Perform product update
async function updateProduct(supabase: any, id: number, updateData: any) {
  const { data, error } = await supabase
    .from("product")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error("Failed to update product: " + error.message);

  return data;
}

// Audit log the changes
async function createAuditLogEntries(
  supabase: any,
  productId: number,
  userId: string,
  currentProduct: any,
  updatedProduct: any
) {
  const auditEntries = Object.keys(updatedProduct)
    .filter(
      (key) =>
        key !== "updated_at" && currentProduct[key] !== updatedProduct[key]
    )
    .map((key) => ({
      product_id: productId,
      changed_by: userId,
      changed_field: key,
      old_values: String(currentProduct[key]),
      new_values: String(updatedProduct[key]),
    }));

  if (auditEntries.length > 0) {
    const { error } = await supabase
      .from("product_audit_log")
      .insert(auditEntries);
    if (error) console.error("Failed to log audit entries:", error);
  }
}
// --> Version 1 Product Audit Log

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<ProductInterface | null>>> {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  if (!id) {
    return NextResponse.json(error("Invalid product ID", 400), { status: 400 });
  }

  const supabase = await createClient();

  const user = await getAuthenticatedUser(supabase);

  const { data: existing, error: fetchError } = await supabase
    .from("product")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!existing || fetchError) {
    return NextResponse.json(error("Product not found", 404), { status: 404 });
  }

  try {
    const body = await req.json();

    if (body.sku && body.sku !== existing.sku) {
      return NextResponse.json(error("SKU cannot be changed", 400), {
        status: 400,
      });
    }

    if (
      typeof body.is_active === "boolean" &&
      body.is_active !== existing.is_active
    ) {
      const { data: auth } = await supabase.auth.getUser();
      const changed_by = auth?.user?.email || "system";

      const { error: toggleError } = await supabase
        .from("product")
        .update({
          is_active: body.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (toggleError) {
        return NextResponse.json(error("Failed to update active status", 500), {
          status: 500,
        });
      }

      return NextResponse.json(
        success(
          null,
          `Product ${
            body.is_active ? "reactivated" : "deactivated"
          } successfully`
        ),
        { status: 200 }
      );
    }

    // Regular update logic
    const { reason, ...rest } = body;

    const updateData = {
      ...rest,
      sku: existing.sku,
      updated_at: new Date().toISOString(),
    };

    // --> Version 1 Product Audit Log
    const updatedProduct = await updateProduct(supabase, id, updateData);

    await createAuditLogEntries(
      supabase,
      id,
      user.id,
      existing,
      updatedProduct
    );
    // --> Version 1 Product Audit Log

    // --> Version 0 Product Price Log
    // const { data: updated, error: updateError } = await supabase
    //   .from("product")
    //   .update(updateData)
    //   .eq("id", id)
    //   .select()
    //   .single();

    // if (updateError) {
    //   return NextResponse.json(error("Failed to update product", 500), {
    //     status: 500,
    //   });
    // }

    // Log price history
    // const priceChanged =
    //   rest.unit_price != null && rest.unit_price !== existing.unit_price;

    // if (priceChanged) {
    //   const { data: auth } = await supabase.auth.getUser();
    //   const updated_by = auth?.user?.email || "system";

    //   await supabase.from("product_price_history").insert([
    //     {
    //       product_id: id,
    //       old_price: existing.unit_price,
    //       new_price: rest.unit_price,
    //       reason: reason || null,
    //       updated_by,
    //     },
    //   ]);
    // }
    // --> Version 0 Product Price Log

    return NextResponse.json(
      success(updatedProduct, "Product updated successfully"),
      {
        status: 200,
      }
    );
  } catch (e) {
    console.error("PUT /product/:id error:", e);
    return NextResponse.json(error("Invalid request body", 400), {
      status: 400,
    });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  const supabase = await createClient();

  if (!id) {
    return NextResponse.json(error("Invalid product ID", 400), { status: 400 });
  }

  const [{ data: po }, { data: invoice }, { data: stock }] = await Promise.all([
    supabase
      .from("purchase_order_items")
      .select("id")
      .eq("product_id", id)
      .limit(1),
    supabase
      .from("purchase_invoice_item")
      .select("id")
      .eq("product_id", id)
      .limit(1),
    supabase
      .from("stock_transaction")
      .select("id")
      .eq("product_id", id)
      .limit(1),
  ]);

  if (po?.length || invoice?.length || stock?.length) {
    return NextResponse.json(
      error(
        "Cannot delete a product that is referenced in PO, invoice, or stock.",
        400
      ),
      { status: 400 }
    );
  }

  const { error: deleteError } = await supabase
    .from("product")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json(error("Failed to delete product", 500), {
      status: 500,
    });
  }

  return NextResponse.json(success(null, "Product deleted successfully"), {
    status: 200,
  });
}
