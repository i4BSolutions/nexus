import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ProductCurrencyInterface } from "@/types/product/product.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";

/**
 * This API route retrieves a region by ID.
 * @param req - NextRequest object
 * @param context - Context object
 * @returns NextResponse ApiResponse<PurchaseOrderRegionInterface | null>
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<ProductCurrencyInterface | null>>> {
  const supabase = await createClient();

  try {
    // Validate region ID
    const { id: idStr } = await context.params;

    const { data, error: dbError } = await supabase
      .from("product_currency")
      .select("*")
      .eq("id", idStr)
      .single();

    if (dbError) {
      throw new Error(
        "Failed to retrieve product currency: " + dbError.message
      );
    }

    if (!data) {
      throw new Error("Product currency not found");
    }

    return NextResponse.json(
      success(data, "Product currency retrieved successfully"),
      {
        status: 200,
      }
    );
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Invalid request";
    const statusCode = errorMessage.includes("Unauthorized")
      ? 401
      : errorMessage.includes("Invalid product currency ID")
      ? 400
      : errorMessage.includes("Product currency not found")
      ? 404
      : 500;

    return NextResponse.json(error(errorMessage, statusCode), {
      status: 500,
    });
  }
}
