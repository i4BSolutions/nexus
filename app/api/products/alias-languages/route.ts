"use server";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { success, error } from "@/lib/api-response";
import { ApiResponse } from "@/types/shared/api-response-type";
import { AliasLanguageInterface } from "@/types/product/alias/language.type";

// GET /api/product-alias/languages
export async function GET(): Promise<
  NextResponse<ApiResponse<AliasLanguageInterface[]> | ApiResponse<null>>
> {
  const supabase = await createClient();

  const { data, error: dbError } = await supabase
    .from("product_alias_language")
    .select("*")
    .order("created_at", { ascending: true });

  if (dbError) {
    return NextResponse.json(
      error("Failed to fetch alias languages: " + dbError.message, 500),
      { status: 500 }
    );
  }

  return NextResponse.json(success(data ?? [], "Alias languages fetched"), {
    status: 200,
  });
}

// POST /api/product-alias/languages
export async function POST(
  req: NextRequest
): Promise<
  NextResponse<ApiResponse<AliasLanguageInterface[]> | ApiResponse<null>>
> {
  const supabase = await createClient();

  try {
    const body = await req.json();
    const name: string | undefined = (body?.name ?? "").trim();

    if (!name) {
      return NextResponse.json(error("Name is required", 400), { status: 400 });
    }

    const { data, error: dbError } = await supabase
      .from("product_alias_language")
      .insert([{ name }])
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        error("Failed to create alias language: " + dbError.message, 500),
        { status: 500 }
      );
    }

    return NextResponse.json(
      success(data, "Alias language created successfully"),
      {
        status: 201,
      }
    );
  } catch {
    return NextResponse.json(error("Invalid request body", 400), {
      status: 400,
    });
  }
}
