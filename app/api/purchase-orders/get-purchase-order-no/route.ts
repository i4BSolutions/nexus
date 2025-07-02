import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/api-response-type";
import { error, success } from "@/lib/api-response";
import { generatePoNumber } from "@/utils/generatePoNumber";

export async function GET(): Promise<NextResponse<ApiResponse<string | null>>> {
  const supabase = await createClient();

  const { data, error: dbError } = await supabase
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

  if (!data) {
    const defaultPoNo = "PO-2025-1000";

    return NextResponse.json(
      success(defaultPoNo, "Default PO number retrieved"),
      {
        status: 200,
      }
    );
  }

  const generatedPoNumber = generatePoNumber(data.purchase_order_no);

  return NextResponse.json(
    success(generatedPoNumber, "Latest PO number retrieved"),
    {
      status: 200,
    }
  );
}
