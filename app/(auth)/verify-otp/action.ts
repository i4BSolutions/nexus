"use server";

import { createClient } from "@/lib/supabase/server";

export async function verfiyOtp(email: string, code: string) {
  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "email",
  });

  if (error) {
    throw new Error(error.message);
  }
  return session;
}
