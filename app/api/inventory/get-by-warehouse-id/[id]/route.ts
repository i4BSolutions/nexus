import { success, error } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { InventoryInterface } from "@/types/inventory/inventory.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<InventoryInterface | any>>> {
  const supabase = await createClient();

  try {
    const { id: idStr } = await context.params;

    if (!idStr) {
      return NextResponse.json(error("Warehouse ID is required", 400), {
        status: 400,
      });
    }

    const { data, error: dbError } = await supabase
      .from("inventory")
      .select(
        `
        id,
        product:product_id (
          name,
          sku
        ),
        quantity,
        created_at

      `
      )
      .eq("warehouse_id", idStr);

    if (dbError) {
      return NextResponse.json(error("Failed to fetch inventory", 500), {
        status: 500,
      });
    }

    return NextResponse.json(success(data, "Inventory retrieved"), {
      status: 200,
    });
  } catch (err) {
    return NextResponse.json(error("Unexpected server error", 500), {
      status: 500,
    });
  }
}
