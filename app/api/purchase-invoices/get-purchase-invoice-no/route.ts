import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/shared/api-response-type";
import { generatePiNumber } from "@/utils/generatePiNumber";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<ApiResponse<string | null>>> {
  const supabase = await createClient();

  const { data: latestPiData, error: dbError } = await supabase
    .from("purchase_invoice")
    .select("purchase_invoice_number")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (dbError) {
    return NextResponse.json(error(dbError.message), { status: 500 });
  }

  const generatedPiNumber = generatePiNumber(
    latestPiData?.purchase_invoice_number ?? null
  );

  return NextResponse.json(
    success(generatedPiNumber, "Latest PI number retrieved"),
    {
      status: 200,
    }
  );
}
