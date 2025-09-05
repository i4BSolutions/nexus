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
    return NextResponse.json(error(dbError.message, 500), {
      status: 500,
    });
  }

  return NextResponse.json(success(data, "Rank retrieved successfully"), {
    status: 200,
  });
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<RankInterface | any>>> {
  const supabase = await createClient();

  try {
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(error("Rank name is required", 400), {
        status: 400,
      });
    }

    // Optionally, check for duplicates
    const { data: existing, error: findError } = await supabase
      .from("person_rank")
      .select("*")
      .eq("name", name.trim())
      .maybeSingle();

    if (findError) {
      return NextResponse.json(error("Failed to check for duplicates", 500), {
        status: 500,
      });
    }

    if (existing) {
      return NextResponse.json(error("Rank already exists", 409), {
        status: 409,
      });
    }

    const { data, error: insertError } = await supabase
      .from("person_rank")
      .insert([{ name: name.trim() }])
      .select()
      .maybeSingle();

    if (insertError) {
      return NextResponse.json(error("Failed to create rank", 500), {
        status: 500,
      });
    }

    return NextResponse.json(success(data, "Rank created successfully"), {
      status: 201,
    });
  } catch (e) {
    return NextResponse.json(error("Invalid request body", 400), {
      status: 400,
    });
  }
}
