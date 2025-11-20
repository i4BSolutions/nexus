import { error, success } from "@/lib/api-response";
import { PERMISSION_KEYS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";

const ALL_TRUE: Record<string, boolean> = Object.fromEntries(
  PERMISSION_KEYS.map((k) => [k, true])
);

export async function GET(
  req: NextRequest
): Promise<
  NextResponse<ApiResponse<{ isLastAdmin: boolean }> | ApiResponse<null>>
> {
  const supabase = await createClient();

  const searchParams = req.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(error("Invalid user ID", 400), {
      status: 400,
    });
  }

  const { data: admins, error: dbError } = await supabase
    .from("user_profiles")
    .select("id")
    .contains("permissions", ALL_TRUE);

  if (dbError) {
    return NextResponse.json(error("Failed to check admin users", 500), {
      status: 500,
    });
  }

  const isAdmin = admins.some((admin) => admin.id === userId);
  const isLastAdmin = admins.length === 1 && isAdmin;

  return NextResponse.json(
    success({ isLastAdmin }, "Checked last admin status successfully"),
    { status: 200 }
  );
}
