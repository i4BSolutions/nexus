import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { error, success } from "@/lib/api-response";
import { ApiResponse } from "@/types/shared/api-response-type";
import { getAuthenticatedUser } from "@/helper/getUser";

type PersonRow = {
  id: number;
  name: string | null;
  email: string | null;
  status: boolean;
};

type DeactivateResult = {
  person: PersonRow;
  relatedCounts: {
    purchase_orders: number;
    suppliers: number;
    transactions: number;
  };
};

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

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<DeactivateResult> | ApiResponse<null>>> {
  const supabase = await createClient();
  const { id } = await context.params;

  if (!id || Number.isNaN(Number(id))) {
    return NextResponse.json(error("Invalid person id", 400), { status: 400 });
  }

  const user = await getAuthenticatedUser(supabase);

  if (!user) {
    return NextResponse.json(error("Unauthorized", 401), { status: 401 });
  }

  // Load current person
  const { data: person, error: loadErr } = await supabase
    .from("person")
    .select("id,name,email,status")
    .eq("id", id)
    .maybeSingle<PersonRow>();

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
          person,
          relatedCounts: { purchase_orders: 0, suppliers: 0, transactions: 0 },
        },
        "Person is already inactive"
      ),
      { status: 200 }
    );
  }

  // Count related rows in parallel
  const poQ = supabase
    .from("purchase_order")
    .select("id", { count: "exact", head: true })
    .or(
      `contact_person_id.eq.${id},authorized_signer_id.eq.${id},sign_person_id.eq.${id}`
    );

  const supplierQ = supabase
    .from("supplier")
    .select("id", { count: "exact", head: true })
    .eq("contact_person_id", id);

  const trxQ = supabase
    .from("stock_transaction")
    .select("id", { count: "exact", head: true })
    .eq("approve_by_contact_id", id);

  const [
    { count: poCount, error: poErr },
    { count: supCount, error: supErr },
    { count: trxCount, error: trxErr },
  ] = await Promise.all([poQ, supplierQ, trxQ]);

  if (poErr || supErr || trxErr) {
    const msg = [poErr?.message, supErr?.message, trxErr?.message]
      .filter(Boolean)
      .join("; ");
    return NextResponse.json(error(`Failed to check relations: ${msg}`, 500), {
      status: 500,
    });
  }

  // Block if any relations exist
  if ((poCount ?? 0) > 0 || (supCount ?? 0) > 0 || (trxCount ?? 0) > 0) {
    return NextResponse.json(
      error("Cannot deactivate: person has related data.", 409, {
        purchase_orders: poCount ?? 0,
        suppliers: supCount ?? 0,
        transactions: trxCount ?? 0,
      }),
      { status: 409 }
    );
  }

  // No relations -> deactivate
  const { data: updated, error: upErr } = await supabase
    .from("person")
    .update({ status: false })
    .eq("id", id)
    .select("id,name,email,status")
    .maybeSingle<PersonRow>();

  if (upErr || !updated) {
    return NextResponse.json(error("Failed to deactivate person", 500), {
      status: 500,
    });
  }

  await createPersonAuditLogEntries(supabase, user.id, person, updated);

  return NextResponse.json(
    success(
      {
        person: updated,
        relatedCounts: { purchase_orders: 0, suppliers: 0, transactions: 0 },
      },
      "Person deactivated successfully"
    ),
    { status: 200 }
  );
}
