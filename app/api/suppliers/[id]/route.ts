import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { success, error } from "@/lib/api-response";
import { ApiResponse } from "@/types/api-response-type";
import { SupplierInterface } from "@/types/supplier/supplier.type";

// This API route retrieves a supplier by ID and updates it if necessary.
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<SupplierInterface | null>>> {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  const supabase = await createClient();

  if (isNaN(id)) {
    return NextResponse.json(error("Invalid supplier ID", 400), {
      status: 400,
    });
  }

  try {
    const body = await req.json();
    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    const { data, error: dbError } = await supabase
      .from("supplier")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(error("Failed to update supplier", 500), {
        status: 500,
      });
    }

    return NextResponse.json(success(data, "Supplier updated successfully"), {
      status: 200,
    });
  } catch (e) {
    return NextResponse.json(error("Invalid request body", 400), {
      status: 400,
    });
  }
}

// This API route retrieves a supplier by ID and deletes it if no associated orders/invoices exist.
// TODO: Should not be able to delete if there are associated orders/invoices
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  const supabase = await createClient();

  if (isNaN(id)) {
    return NextResponse.json(error("Invalid supplier ID", 400), {
      status: 400,
    });
  }

  const { error: dbError } = await supabase
    .from("supplier")
    .delete()
    .eq("id", id);

  if (dbError) {
    return NextResponse.json(error("Failed to delete supplier", 500), {
      status: 500,
    });
  }

  return NextResponse.json(success(null, "Supplier deleted successfully"), {
    status: 200,
  });
}

// This API route retrieves a supplier by ID.
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<SupplierInterface | null>>> {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  const supabase = await createClient();

  if (isNaN(id)) {
    return NextResponse.json(error("Invalid supplier ID", 400), {
      status: 400,
    });
  }

  const { data, error: dbError } = await supabase
    .from("supplier")
    .select("*")
    .eq("id", id)
    .single();

  if (dbError) {
    return NextResponse.json(error("Failed to retrieve supplier", 500), {
      status: 500,
    });
  }

  if (!data) {
    return NextResponse.json(error("Supplier not found", 404), {
      status: 404,
    });
  }

  return NextResponse.json(success(data, "Supplier retrieved successfully"), {
    status: 200,
  });
}
