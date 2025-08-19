import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/shared/api-response-type";
import { generateSKU } from "@/utils/generateSKU";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<ApiResponse<string | null>>> {
  const supabase = await createClient();

  const { data, error: dbError } = await supabase
    .from("product")
    .select("sku")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (dbError) {
    return NextResponse.json(error("Failed to fetch latest SKU", 500), {
      status: 500,
    });
  }

  if (!data) {
    const defaultSku = "AA-100000";

    return NextResponse.json(success(defaultSku, "Default SKU retrieved"), {
      status: 200,
    });
  }

  const generatedSku = generateSKU(data.sku);
  return NextResponse.json(success(generatedSku, "Latest SKU retrieved"), {
    status: 200,
  });
}
