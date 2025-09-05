import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { PersonInterface, PersonResponse } from "@/types/person/person.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<PersonResponse> | ApiResponse<null>>> {
  const supabase = await createClient();

  const { searchParams } = new URL(req.url);

  const search = searchParams.get("q")?.trim() || "";
  const rank = searchParams.get("status")?.trim() || "";
  const page = Number(searchParams.get("page")) || 1;
  const pageSizeParam = searchParams.get("pageSize") || "10";
  const pageSize =
    pageSizeParam === "all" ? "all" : parseInt(pageSizeParam, 10);

  let query = supabase
    .from("person")
    .select("*, rank:rank_id(name)", { count: "exact" })
    .order("id", { ascending: false });

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,rank:rank_id.name.ilike.%${search}%`
    );
  }

  if (rank !== "") {
    query = query.eq("rank_id", rank);
  }

  if (pageSize !== "all") {
    query = query.range((page - 1) * pageSize, page * pageSize - 1);
  }

  const { data: items, error: dbError, count } = await query;

  if (dbError) {
    return NextResponse.json(error("Failed to fetch contact person", 500), {
      status: 500,
    });
  }

  const formattedItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    rank: item.rank?.name || "",
    status: item.status,
  }));

  const response: PersonResponse = {
    items: formattedItems,
    total: count || 0,
    page,
    pageSize: pageSize === "all" ? count || 0 : pageSize,
  };

  return NextResponse.json(
    success(response, "Persons retrieved successfully"),
    {
      status: 200,
    }
  );
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<PersonInterface> | ApiResponse<null>>> {
  const supabase = await createClient();
  const body = await req.json();

  const { name, email, rank, department } = body;

  if (!name) {
    return NextResponse.json(error("Name is required"), { status: 400 });
  }

  const { data, error: dbError } = await supabase
    .from("person")
    .insert([
      {
        name: name.trim(),
        email: email.trim(),
        rank_id: rank,
        department_id: department,
      },
    ])
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
