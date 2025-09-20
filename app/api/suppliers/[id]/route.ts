// Import section remains unchanged
import { getAuthenticatedUser } from "@/helper/getUser";
import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/shared/api-response-type";
import { SupplierInterface } from "@/types/supplier/supplier.type";
import { NextRequest, NextResponse } from "next/server";

// Validate ID
function validateSupplierId(idStr: string): number {
  const id = parseInt(idStr);
  if (isNaN(id)) throw new Error("Invalid supplier ID");
  return id;
}

// Check for purchase orders
async function hasAssociatedPurchaseOrders(
  supabase: any,
  supplierId: number
): Promise<boolean> {
  const { data, error } = await supabase
    .from("purchase_order")
    .select("id", { count: "exact" })
    .eq("supplier_id", supplierId);

  if (error) {
    throw new Error(
      "Failed to check associated purchase orders: " + error.message
    );
  }

  return data && data.length > 0;
}

// Get current supplier
async function getCurrentSupplier(supabase: any, id: number) {
  const { data, error } = await supabase
    .from("supplier")
    .select("*")
    .eq("id", id)
    .single();
  if (error)
    throw new Error("Failed to fetch current supplier data: " + error.message);
  if (!data) throw new Error("Supplier not found");
  return data;
}

// Perform supplier update
async function updateSupplier(supabase: any, id: number, updateData: any) {
  const { data, error } = await supabase
    .from("supplier")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error("Failed to update supplier: " + error.message);
  return data;
}

// Log changes
async function createAuditLogEntries(
  supabase: any,
  supplierId: number,
  userId: string,
  currentSupplier: any,
  updatedSupplier: any
) {
  const auditEntries = Object.keys(updatedSupplier)
    .filter(
      (key) =>
        key !== "updated_at" && currentSupplier[key] !== updatedSupplier[key]
    )
    .map((key) => ({
      supplier_id: supplierId,
      changed_by: userId,
      changed_field: key,
      old_values: String(currentSupplier[key]),
      new_values: String(updatedSupplier[key]),
    }));

  if (auditEntries.length > 0) {
    const { error } = await supabase
      .from("supplier_audit_log")
      .insert(auditEntries);
    if (error) console.error("Failed to log audit entries:", error);
  }
}

// PUT handler
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<SupplierInterface | null>>> {
  const supabase = await createClient();

  try {
    const { id: idStr } = await context.params;
    const id = validateSupplierId(idStr);
    const user = await getAuthenticatedUser(supabase);
    const currentSupplier = await getCurrentSupplier(supabase, id);

    const body = await req.json();
    const updateData = {
      ...body,
      contact_person: "deprecated_field",
      contact_person_id: body.contact_person,
      updated_at: new Date().toISOString(),
    };

    const goingInactive =
      ("status" in updateData && updateData.status === false) ||
      ("is_active" in updateData && updateData.is_active === false);

    if (goingInactive) {
      const hasOrders = await hasAssociatedPurchaseOrders(supabase, id);

      if (hasOrders) {
        return NextResponse.json(
          error(
            "Cannot inactivate supplier with existing purchase orders",
            409
          ),
          { status: 409 }
        );
      }
    }

    const updatedSupplier = await updateSupplier(supabase, id, updateData);

    await createAuditLogEntries(
      supabase,
      id,
      user.id,
      currentSupplier,
      updatedSupplier
    );

    return NextResponse.json(
      success(updatedSupplier, "Supplier updated successfully"),
      {
        status: 200,
      }
    );
  } catch (e) {
    const errorMessage =
      e instanceof Error ? e.message : "Invalid request body";
    const statusCode = errorMessage.includes("Unauthorized")
      ? 401
      : errorMessage.includes("Invalid supplier ID")
      ? 400
      : errorMessage.includes("Supplier not found")
      ? 404
      : 400;

    return NextResponse.json(error(errorMessage, statusCode), {
      status: statusCode,
    });
  }
}

// DELETE handler
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  const supabase = await createClient();

  try {
    const { id: idStr } = await context.params;
    const id = validateSupplierId(idStr);

    const hasOrders = await hasAssociatedPurchaseOrders(supabase, id);
    if (hasOrders) {
      return NextResponse.json(
        error("Cannot delete supplier with existing purchase orders", 409),
        { status: 409 }
      );
    }

    const { error: dbError } = await supabase
      .from("supplier")
      .delete()
      .eq("id", id);
    if (dbError)
      throw new Error("Failed to delete supplier: " + dbError.message);

    return NextResponse.json(success(null, "Supplier deleted successfully"), {
      status: 200,
    });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Invalid request";
    const statusCode = errorMessage.includes("Unauthorized")
      ? 401
      : errorMessage.includes("Invalid supplier ID")
      ? 400
      : 500;

    return NextResponse.json(error(errorMessage, statusCode), {
      status: statusCode,
    });
  }
}

// GET handler remains unchanged
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<SupplierInterface | null>>> {
  const supabase = await createClient();

  try {
    const { id: idStr } = await context.params;
    const id = validateSupplierId(idStr);

    const { data, error: dbError } = await supabase
      .from("supplier")
      .select("*, contact_person:contact_person_id(name)")
      .eq("id", id)
      .single();

    if (dbError)
      throw new Error("Failed to retrieve supplier: " + dbError.message);
    if (!data) throw new Error("Supplier not found");

    const formattedItems = {
      id: data.id,
      name: data.name,
      contact_person: data.contact_person?.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      status: data.status,
      created_at: data.inserted_at,
      updated_at: data.updated_at,
    };

    return NextResponse.json(
      success(formattedItems, "Supplier retrieved successfully"),
      {
        status: 200,
      }
    );
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Invalid request";
    const statusCode = errorMessage.includes("Unauthorized")
      ? 401
      : errorMessage.includes("Invalid supplier ID")
      ? 400
      : errorMessage.includes("Supplier not found")
      ? 404
      : 500;

    return NextResponse.json(error(errorMessage, statusCode), {
      status: statusCode,
    });
  }
}
