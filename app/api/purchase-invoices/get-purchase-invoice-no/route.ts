import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/shared/api-response-type";
import { generateEntityNumber } from "@/utils/generateEntityNumber";
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

  if (!latestPiData) {
    const currentYear = new Date().getUTCFullYear();
    const defaultPiNo = `INV-${currentYear}-00001`;

    return NextResponse.json(
      success(defaultPiNo, "Default PI number retrieved"),
      {
        status: 200,
      }
    );
  }

  const generatedPiNumber = generateEntityNumber(
    latestPiData.purchase_invoice_number,
    5
  );

  return NextResponse.json(
    success(generatedPiNumber, "Latest PI number retrieved"),
    {
      status: 200,
    }
  );
}
