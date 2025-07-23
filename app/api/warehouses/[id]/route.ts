import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/shared/api-response-type";
import { WarehouseInterface } from "@/types/warehouse/warehouse.type";
import { NextRequest, NextResponse } from "next/server";

/**
 * This API route retrieves a warehouse by ID and updates it if necessary.
 * @param req - NextRequest object
 * @param context - Context object
 * @returns NextResponse ApiResponse<WarehouseInterface | null>
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<WarehouseInterface | null>>> {
  const supabase = await createClient();
  const { id: idStr } = await context.params;

  const body = await req.json();

  try {
    const { data, error: dbError } = await supabase
      .from("warehouse")
      .update(body)
      .eq("id", idStr)
      .select()
      .single();

    return NextResponse.json(success(data, "Warehouse updated successfully"), {
      status: 201,
    });
  } catch (e: any) {
    return NextResponse.json(error(e.message, 500), {
      status: 500,
    });
  }
}
