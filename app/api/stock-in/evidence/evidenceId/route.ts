import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const bucket = "core-orbit";

export async function GET(
  req: NextRequest,
  { params }: { params: { evidenceId: string } }
) {
  const supabase = await createClient();

  const { data, error: evidenceError } = await supabase
    .from("stock_in_evidence")
    .select("file_key")
    .eq("id", params.evidenceId)
    .single();

  if (evidenceError || !data) {
    return NextResponse.json(error("Evidence not found", 404), { status: 404 });
  }

  const { data: signedUrl } = await supabase.storage
    .from(bucket)
    .createSignedUrl(data.file_key, 60 * 60); // 1 hour

  return NextResponse.json(success({ url: signedUrl?.signedUrl }));
}
