"use server";

import { createClient } from "@/lib/supabase/server";

export async function signInWithOtp(email: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
  return data;
}
