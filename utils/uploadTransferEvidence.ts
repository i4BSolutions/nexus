import { createClient } from "@/lib/supabase/server";

interface UploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

export async function uploadTransferEvidenceImage(
  bucket: string,
  allocationId: number,
  file: File
): Promise<UploadResult> {
  const supabase = await createClient();

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: "Only JPEG and PNG files are allowed." };
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "File size exceeds 5MB limit." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${allocationId}/${file.name}`;

  // Upload to specified bucket
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, filePath: filename };
}
