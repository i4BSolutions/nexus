import { getAuthenticatedUser } from "@/helper/getUser";
import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const MAX_IMAGE_MB = 5;
const MAX_PDF_MB = 5;
const BUCKET = "core-orbit";

// extend if you later allow webp/heic
const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png"]);

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = req.nextUrl;
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(error("Missing key", 400), { status: 400 });
    }

    // Download the file as Blob
    const { data, error: downloadErr } = await supabase.storage
      .from(BUCKET)
      .download(key);

    if (downloadErr || !data) {
      return NextResponse.json(
        error(`Failed to download file: ${downloadErr?.message}`, 404),
        { status: 404 }
      );
    }

    // Guess Content-Type by extension
    let contentType = "application/octet-stream";
    if (key.endsWith(".png")) contentType = "image/png";
    if (key.endsWith(".jpg") || key.endsWith(".jpeg"))
      contentType = "image/jpeg";
    if (key.endsWith(".pdf")) contentType = "application/pdf";

    // Convert Blob → ReadableStream
    const stream = data.stream();

    return new NextResponse(stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${key.split("/").pop()}"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json(error(e?.message || "Server error", 500), {
      status: 500,
    });
  }
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<any>>> {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const type = (form.get("type") as string | null)?.toLowerCase() ?? "";

  if (!file) {
    return NextResponse.json(error("Missing file field", 400), { status: 400 });
  }

  const mime = file.type || "application/octet-stream";
  const size = file.size;

  const isImage = ALLOWED_IMAGE_MIME.has(mime);
  const isPdf = mime === "application/pdf";

  if (!isImage && !isPdf) {
    return NextResponse.json(error("Only JPG/PNG or PDF allowed", 400), {
      status: 400,
    });
  }
  if (isImage && size > MAX_IMAGE_MB * 1024 * 1024) {
    return NextResponse.json(error(`Image must be ≤ ${MAX_IMAGE_MB}MB`, 400), {
      status: 400,
    });
  }
  if (isPdf && size > MAX_PDF_MB * 1024 * 1024) {
    return NextResponse.json(error(`PDF must be ≤ ${MAX_PDF_MB}MB`, 400), {
      status: 400,
    });
  }

  const supabase = await createClient();

  const fileId = uuidv4();

  const ext = file.name.split(".").pop() ?? (isPdf ? "pdf" : "jpg");
  const folder =
    isPdf || type === "pdf"
      ? "stock-out-evidence/pdf"
      : "stock-out-evidence/photos";
  const key = `${folder}/${new Date()
    .toISOString()
    .slice(0, 10)}/${fileId}.${ext}`;

  // ➜ Upload the File blob directly (no Buffer conversion)
  let uploadErr: any = null;
  const tryUpload = async (ct: string) => {
    const { error: err } = await supabase.storage
      .from(BUCKET)
      .upload(key, file, {
        contentType: ct, // first try with real content-type
        upsert: false,
        cacheControl: "3600",
      });
    return err;
  };

  // 1st attempt: true content-type
  uploadErr = await tryUpload(isPdf ? "application/pdf" : mime);

  // Fallback if bucket complains about mime type
  if (uploadErr && /mime type .* is not supported/i.test(uploadErr.message)) {
    uploadErr = await tryUpload("application/octet-stream");
  }

  if (uploadErr) {
    return NextResponse.json(
      error(`Upload failed: ${uploadErr.message}`, 500),
      { status: 500 }
    );
  }

  // Signed URL for immediate preview
  const { data: signed, error: signedErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(key, 60 * 60);

  if (signedErr) {
    return NextResponse.json(
      error(`Cannot sign URL: ${signedErr.message}`, 500),
      { status: 500 }
    );
  }

  return NextResponse.json(
    success(
      {
        id: fileId,
        key,
        url: signed.signedUrl, // AntD <Upload> will use this as the blue link
        original_filename: file.name,
        mime,
        size_bytes: size,
      },
      "Uploaded"
    ),
    { status: 201 }
  );
}

export async function DELETE(
  req: NextRequest
): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) {
      return NextResponse.json(error("Unauthorized", 401), { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const key: string | undefined = body?.key;
    const keys: string[] | undefined = body?.keys;

    // normalize to an array
    let toRemove: string[] = [];
    if (Array.isArray(keys) && keys.length) {
      toRemove = keys;
    } else if (typeof key === "string" && key.length) {
      toRemove = [key];
    }

    if (!toRemove.length) {
      return NextResponse.json(error("Missing key(s) to delete", 400), {
        status: 400,
      });
    }

    // (Optional) tiny sanity check to avoid accidental bucket root deletes
    const invalid = toRemove.find((k) => k.includes("..") || k.startsWith("/"));
    if (invalid) {
      return NextResponse.json(error(`Invalid key: ${invalid}`, 400), {
        status: 400,
      });
    }

    const { data, error: rmErr } = await supabase.storage
      .from(BUCKET)
      .remove(toRemove);

    if (rmErr) {
      return NextResponse.json(error(`Delete failed: ${rmErr.message}`, 500), {
        status: 500,
      });
    }

    // Supabase returns an array with objects of deleted paths (and/or nulls if not found)
    return NextResponse.json(
      success(
        { removed: data?.map((d) => d?.name).filter(Boolean) ?? [] },
        "Deleted"
      ),
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(error(e?.message || "Server error", 500), {
      status: 500,
    });
  }
}
