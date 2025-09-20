import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { error, success } from "@/lib/api-response";
import { ApiResponse } from "@/types/shared/api-response-type";
import { getAuthenticatedUser } from "@/helper/getUser";
import { PersonInterface } from "@/types/person/person.type";

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
    const { error: logErr } = await supabase
      .from("person_audit_log")
      .insert(entries);
    if (logErr) console.error("Failed to log person audit entries:", logErr);
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<PersonInterface> | ApiResponse<null>>> {
  const supabase = await createClient();
  const { id } = await context.params;

  if (!id || Number.isNaN(Number(id))) {
    return NextResponse.json(error("Invalid person id", 400), { status: 400 });
  }

  const user = await getAuthenticatedUser(supabase);
  if (!user) {
    return NextResponse.json(error("Unauthorized", 401), { status: 401 });
  }

  const { data: person, error: loadErr } = await supabase
    .from("person")
    .select("id,name,email,status")
    .eq("id", id)
    .maybeSingle<PersonInterface>();

  if (loadErr) {
    return NextResponse.json(
      error(`Failed to load person: ${loadErr.message}`, 500),
      { status: 500 }
    );
  }
  if (!person) {
    return NextResponse.json(error("Person not found", 404), { status: 404 });
  }

  // If already inactive, be idempotent
  if (person.status === false) {
    return NextResponse.json(
      success(
        {
          id: person.id,
          name: person.name,
          email: person.email,
          status: person.status,
        },
        "Person is already inactive"
      ),
      { status: 200 }
    );
  }

  // Directly deactivate without any validation/checks
  const { data: updated, error: upErr } = await supabase
    .from("person")
    .update({ status: false })
    .eq("id", id)
    .select("id,name,email,status")
    .maybeSingle<PersonInterface>();

  if (upErr || !updated) {
    return NextResponse.json(error("Failed to deactivate person", 500), {
      status: 500,
    });
  }

  // Audit log (optional, still helpful)
  await createPersonAuditLogEntries(supabase, user.id, person, updated);

  return NextResponse.json(
    success(
      {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        status: updated.status,
      },
      "Person deactivated successfully"
    ),
    { status: 200 }
  );
}
