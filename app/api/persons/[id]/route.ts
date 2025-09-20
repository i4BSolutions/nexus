import { getAuthenticatedUser } from "@/helper/getUser";
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

// Write person audit log entries
async function createPersonAuditLogEntries(
  supabase: any,
  userId: string,
  before: any,
  after: any
) {
  if (!before || !after) return;

  const trackedKeys = ["name", "email", "rank_id", "department_id"] as const;

  const entries = trackedKeys
    .filter((key) => before[key] !== after[key])
    .map((key) => ({
      person_id: after.id,
      changed_by: userId,
      changed_field: key,
      old_values: String(before[key]),
      new_values: String(after[key]),
    }));

  if (entries.length > 0) {
    const { error } = await supabase.from("person_audit_log").insert(entries);
    if (error) console.error("Failed to log person audit entries:", error);
  }
}

// PATCH /api/persons/[id] - Update person details (with audit)
export async function PUT(
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

  const user = await getAuthenticatedUser(supabase);

  if (!user) {
    return NextResponse.json(error("Unauthorized", 401), { status: 401 });
  }

  const body = await req.json();
  const { name, email, rank_id, department_id } = body;

  if (
    typeof name === "undefined" &&
    typeof email === "undefined" &&
    typeof rank_id === "undefined" &&
    typeof department_id === "undefined"
  ) {
    return NextResponse.json(error("No fields to update", 400), {
      status: 400,
    });
  }

  // Fetch current row BEFORE update (for audit)
  const { data: currentPerson, error: fetchErr } = await supabase
    .from("person")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) {
    return NextResponse.json(error("Failed to load person", 500), {
      status: 500,
    });
  }
  if (!currentPerson) {
    return NextResponse.json(error("Person not found", 404), { status: 404 });
  }

  // Build update payload
  const updateData: any = {};
  if (typeof name !== "undefined") updateData.name = String(name).trim();
  if (typeof email !== "undefined") updateData.email = String(email).trim();
  if (typeof rank_id !== "undefined") updateData.rank_id = rank_id;
  if (typeof department_id !== "undefined")
    updateData.department_id = department_id;

  // Update and return updated row
  const { data: updatedPerson, error: dbError } = await supabase
    .from("person")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (dbError) {
    return NextResponse.json(error("Failed to update person", 500), {
      status: 500,
    });
  }
  if (!updatedPerson) {
    return NextResponse.json(error("Person not found after update", 404), {
      status: 404,
    });
  }

  // Audit log (non-blocking failure)
  await createPersonAuditLogEntries(
    supabase,
    user.id,
    currentPerson,
    updatedPerson
  );

  return NextResponse.json(
    success(updatedPerson, "Person updated successfully"),
    { status: 200 }
  );
}
