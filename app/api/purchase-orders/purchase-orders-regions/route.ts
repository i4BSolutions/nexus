import { createClient } from "@/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { ApiResponse } from "@/types/api-response-type";
import { PurchaseOrderRegionInterface } from "@/types/purchase-order/purchase-order-region.type";

/**
 * This API route retrieves all purchase order regions from the database
 */
export async function GET(
  req: NextRequest
): Promise<
  NextResponse<ApiResponse<PurchaseOrderRegionInterface[]> | ApiResponse<null>>
> {
  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("purchase_order_region")
    .select("*");

  if (dbError) {
    return NextResponse.json(
      error("Failed to fetch purchase order regions", 500),
      {
        status: 500,
      }
    );
  }

  return NextResponse.json(
    success(data, "Purchase order regions retrieved successfully"),
    {
      status: 200,
    }
  );
}

/**
 * This API route creates a new purchase order region in the database
 */
export async function POST(
  req: NextRequest
): Promise<
  NextResponse<ApiResponse<PurchaseOrderRegionInterface> | ApiResponse<null>>
> {
  const supabase = await createClient();

  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(error("Name is required", 400), { status: 400 });
    }

    const { data, error: dbError } = await supabase
      .from("purchase_order_region")
      .insert({ name })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        error("Failed to create purchase order region", 500),
        { status: 500 }
      );
    }

    return NextResponse.json(
      success(data, "Purchase order region created successfully"),
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      error("Failed to create purchase order region", 500),
      { status: 500 }
    );
  }
}
