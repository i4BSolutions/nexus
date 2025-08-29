import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<ApiResponse<string | null>>> {
  const supabase = await createClient();

  const { data: latestPoData, error: dbError } = await supabase
    .from("purchase_order")
    .select("purchase_order_no")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (dbError) {
    return NextResponse.json(
      error("Failed to fetch latest purchase order number", 500),
      {
        status: 500,
      }
    );
  }

  if (!latestPoData) {
    const currentYear = new Date().getUTCFullYear();
    const defaultPoNo = `PO-${currentYear}-0001`;

    return NextResponse.json(
      success(defaultPoNo, "Default PO number retrieved"),
      {
        status: 200,
      }
    );
  }

  const generatedPoNumber = generateEntityNumber(
    latestPoData.purchase_order_no,
    4
  );

  return NextResponse.json(
    success(generatedPoNumber, "Latest PO number retrieved"),
    {
      status: 200,
    }
  );
}
