import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/helper/getUser";
import { error, success } from "@/lib/api-response";
import { ApiResponse } from "@/types/shared/api-response-type";
import { hashFile } from "@/utils/hash";

const bucket = "core-orbit";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<any>>> {
  const { id: idStr } = await context.params;
  const stockInId = parseInt(idStr);
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json(error("Evidence photo is required", 400), {
      status: 400,
    });
  }
  if (files.length > 10) {
    return NextResponse.json(error("Max 10 photos allowed", 400), {
      status: 400,
    });
  }

  const inserted: any[] = [];

  for (const file of files) {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      return NextResponse.json(error("Only JPEG/PNG allowed", 400), {
        status: 400,
      });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(error("File too large (>5MB)", 400), {
        status: 400,
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileKey = `stock-in-evidence/${stockInId}/${crypto.randomUUID()}-${
      file.name
    }`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileKey, buffer, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json(error("Upload failed", 500), { status: 500 });
    }

    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileKey);

    const { data, error: dbError } = await supabase
      .from("stock_in_evidence")
      .insert({
        stock_in_id: stockInId,
        file_url: publicUrl.publicUrl,
        file_key: fileKey,
        mime_type: file.type,
        size_bytes: file.size,
        hash_sha256: hashFile,
        uploader_user_id: user.id,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(error("DB insert failed", 500), { status: 500 });
    }
    inserted.push(data);
  }

  return NextResponse.json(success(inserted, "Evidence uploaded"), {
    status: 201,
  });
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<any>>> {
  const { id: idStr } = await context.params;
  const stockInId = Number(idStr);
  const supabase = await createClient();

  const { data, error: dbError } = await supabase
    .from("stock_in_evidence")
    .select("id, file_url, mime_type, size_bytes, created_at, uploader_user_id")
    .eq("stock_in_id", stockInId)
    .order("created_at", { ascending: true });

  if (dbError) {
    return NextResponse.json(error("Failed to fetch evidence", 500), {
      status: 500,
    });
  }

  return NextResponse.json(success(data));
}
