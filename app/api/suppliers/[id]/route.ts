import { getAuthenticatedUser } from "@/helper/getUser";
import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/shared/api-response-type";
import { SupplierInterface } from "@/types/supplier/supplier.type";
import { NextRequest, NextResponse } from "next/server";

// function to validate supplier ID
function validateSupplierId(idStr: string): number {
  const id = parseInt(idStr);

  if (isNaN(id)) {
    throw new Error("Invalid supplier ID");
  }

  return id;
}

// function to get current supplier data
async function getCurrentSupplier(supabase: any, id: number) {
  const { data: currentSupplier, error: fetchError } = await supabase
    .from("supplier")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(
      "Failed to fetch current supplier data: " + fetchError?.message
    );
  }

  if (!currentSupplier) {
    throw new Error("Supplier not found");
  }

  return currentSupplier;
}

// function to update supplier
async function updateSupplier(supabase: any, id: number, updateData: any) {
  const { data, error: dbError } = await supabase
    .from("supplier")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (dbError) {
    throw new Error("Failed to update supplier: " + dbError?.message);
  }

  return data;
}

// function to create audit log entries
async function createAuditLogEntries(
  supabase: any,
  supplierId: number,
  userId: string,
  currentSupplier: any,
  updatedSupplier: any
) {
  const auditEntries: Array<{
    supplier_id: number;
    changed_by: string;
    changed_field: string;
    old_values: string;
    new_values: string;
  }> = [];

  // Check each field for changes (excluding updated_at since it's always changed)
  Object.keys(updatedSupplier).forEach((key) => {
    if (key !== "updated_at" && currentSupplier[key] !== updatedSupplier[key]) {
      auditEntries.push({
        supplier_id: supplierId,
        changed_by: userId,
        changed_field: key,
        old_values: String(currentSupplier[key]),
        new_values: String(updatedSupplier[key]),
      });
    }
  });

  // Insert audit entries if there are changes
  if (auditEntries.length > 0) {
    const { error: auditError } = await supabase
      .from("supplier_audit_log")
      .insert(auditEntries);

    if (auditError) {
      console.error("Failed to log audit entries:", auditError);
    }
  }
}

/**
 * This API route retrieves a supplier by ID and updates it if necessary.
 * It also creates audit log entries for the changes made to the supplier.
 * @param req - NextRequest object
 * @param context - Context object
 * @returns NextResponse ApiResponse<SupplierInterface | null>
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<SupplierInterface | null>>> {
  const supabase = await createClient();

  try {
    // Validate supplier ID
    const { id: idStr } = await context.params;
    const id = validateSupplierId(idStr);

    // Get authenticated user
    const user = await getAuthenticatedUser(supabase);

    // Get current supplier data
    const currentSupplier = await getCurrentSupplier(supabase, id);

    // Prepare update data
    const body = await req.json();
    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    // Update supplier
    const updatedSupplier = await updateSupplier(supabase, id, updateData);

    // Create audit log entries
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

/**
 * This API route retrieves a supplier by ID and deletes it if no associated orders/invoices exist.
 * TODO: Should not be able to delete if there are associated orders/invoices
 * @param _req - NextRequest object
 * @param context - Context object
 * @returns NextResponse ApiResponse<null>
 */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  const supabase = await createClient();

  try {
    // Validate supplier ID
    const { id: idStr } = await context.params;
    const id = validateSupplierId(idStr);

    const { error: dbError } = await supabase
      .from("supplier")
      .delete()
      .eq("id", id);

    if (dbError) {
      throw new Error("Failed to delete supplier: " + dbError.message);
    }

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

/**
 * This API route retrieves a supplier by ID.
 * @param req - NextRequest object
 * @param context - Context object
 * @returns NextResponse ApiResponse<SupplierInterface | null>
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<SupplierInterface | null>>> {
  const supabase = await createClient();

  try {
    // Validate supplier ID
    const { id: idStr } = await context.params;
    const id = validateSupplierId(idStr);

    const { data, error: dbError } = await supabase
      .from("supplier")
      .select("*")
      .eq("id", id)
      .single();

    if (dbError) {
      throw new Error("Failed to retrieve supplier: " + dbError.message);
    }

    if (!data) {
      throw new Error("Supplier not found");
    }

    return NextResponse.json(success(data, "Supplier retrieved successfully"), {
      status: 200,
    });
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
