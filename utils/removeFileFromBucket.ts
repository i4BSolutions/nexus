import { createClient } from "@/lib/supabase/server";

export async function deleteFileFromBucket(bucket: string, filePath: string) {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).remove([filePath]);
  if (error) {
    return error.message;
  }
  return null;
}
