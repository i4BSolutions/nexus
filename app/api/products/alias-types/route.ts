"use server";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { success, error } from "@/lib/api-response";
import { ApiResponse } from "@/types/shared/api-response-type";
import { AliasTypeInterface } from "@/types/product/alias/alias-type.type";

// GET /api/product-alias/types
export async function GET(): Promise<
  NextResponse<ApiResponse<AliasTypeInterface[]> | ApiResponse<null>>
> {
  const supabase = await createClient();

  const { data, error: dbError } = await supabase
    .from("product_alias_type")
    .select("*")
    .order("created_at", { ascending: true });

  if (dbError) {
    return NextResponse.json(
      error("Failed to fetch alias types: " + dbError.message, 500),
      {
        status: 500,
      }
    );
  }

  return NextResponse.json(success(data ?? [], "Alias types fetched"), {
    status: 200,
  });
}

// POST /api/product-alias/types
export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<AliasTypeInterface> | ApiResponse<null>>> {
  const supabase = await createClient();

  try {
    const body = await req.json();
    const name: string | undefined = (body?.name ?? "").trim();

    if (!name) {
      return NextResponse.json(error("Name is required", 400), { status: 400 });
    }

    const { data, error: dbError } = await supabase
      .from("product_alias_type")
      .insert([{ name }])
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        error("Failed to create alias type: " + dbError.message, 500),
        { status: 500 }
      );
    }

    return NextResponse.json(success(data, "Alias type created successfully"), {
      status: 201,
    });
  } catch {
    return NextResponse.json(error("Invalid request body", 400), {
      status: 400,
    });
  }
}
