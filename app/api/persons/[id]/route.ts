import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { PersonInterface } from "@/types/person/person.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";

// GET /api/persons/[id] - Get person details
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<PersonInterface | null>>> {
  const supabase = await createClient();
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(error("Person ID is required", 400), {
      status: 400,
    });
  }

  const { data, error: dbError } = await supabase
    .from("person")
    .select("*, rank:rank_id(name), department:department_id(name)")
    .eq("id", id)
    .maybeSingle();

  if (dbError) {
    return NextResponse.json(error("Failed to fetch person", 500), {
      status: 500,
    });
  }

  if (!data) {
    return NextResponse.json(error("Person not found", 404), {
      status: 404,
    });
  }

  const formattedData: PersonInterface = {
    id: data.id,
    name: data.name,
    email: data.email,
    rank: data.rank?.name || "",
    department: data.department?.name || "",
    status: data.status,
  };

  return NextResponse.json(success(formattedData, "Person details retrieved"), {
    status: 200,
  });
}

// PATCH /api/persons/[id] - Update person details
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<PersonInterface | null>>> {
  const supabase = await createClient();
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(error("Person ID is required", 400), {
      status: 400,
    });
  }

  const body = await req.json();

  // Only allow updating certain fields
  const { name, email, rank_id, department_id } = body;

  if (!name && !email && !rank_id && !department_id) {
    return NextResponse.json(error("No fields to update", 400), {
      status: 400,
    });
  }

  const updateData: any = {};
  if (name) updateData.name = name.trim();
  if (email) updateData.email = email.trim();
  if (rank_id) updateData.rank_id = rank_id;
  if (department_id) updateData.department_id = department_id;

  const { data, error: dbError } = await supabase
    .from("person")
    .update(updateData)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (dbError) {
    return NextResponse.json(error("Failed to update person", 500), {
      status: 500,
    });
  }

  if (!data) {
    return NextResponse.json(error("Person not found", 404), {
      status: 404,
    });
  }

  return NextResponse.json(success(data, "Person updated successfully"), {
    status: 200,
  });
}
