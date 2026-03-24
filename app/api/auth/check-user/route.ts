import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = supabaseAdmin;

  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("email", email);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (data.length === 0) {
    return NextResponse.json({ user_id: null }, { status: 200 });
  }

  return NextResponse.json({ user_id: data[0].id }, { status: 200 });
}
