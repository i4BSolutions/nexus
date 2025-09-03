import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { RankInterface } from "@/types/person/rank/rank.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<RankInterface[] | any>>> {
  const supabase = await createClient();

  const { data, error: dbError } = await supabase
    .from("person_rank")
    .select("*");

  if (dbError) {
    return NextResponse.json(error("Failed to fetch ranks", 500), {
      status: 500,
    });
  }

  return NextResponse.json(success(data, "Rank retrieved successfully"), {
    status: 200,
  });
}
