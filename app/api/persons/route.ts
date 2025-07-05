import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { PersonInterface } from "@/types/person/person.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<PersonInterface[]> | ApiResponse<null>>> {
  const supabase = await createClient();
  const { data, error: dbError } = await supabase.from("person").select("*");

  if (dbError) {
    return NextResponse.json(
      error(`Failed to retrieve persons: ${dbError.message}`),
      {
        status: 500,
      }
    );
  }

  return NextResponse.json(success(data, "Persons retrieved successfully"), {
    status: 200,
  });
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<PersonInterface> | ApiResponse<null>>> {
  const supabase = await createClient();
  const body = await req.json();

  const { name } = body;

  if (!name) {
    return NextResponse.json(error("Name is required"), { status: 400 });
  }

  const { data, error: dbError } = await supabase
    .from("person")
    .insert([{ name }])
    .select()
    .single();

  if (dbError) {
    return NextResponse.json(
      error(`Failed to create person: ${dbError.message}`),
      {
        status: 500,
      }
    );
  }

  return NextResponse.json(success(data, "Person created successfully"), {
    status: 200,
  });
}
