/**
 * Helper function to get authenticated user
 * @param supabase - Supabase client
 * @returns User object
 */

export async function getAuthenticatedUser(supabase: any) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  return user;
}
