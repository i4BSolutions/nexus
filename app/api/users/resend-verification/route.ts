import { error, success } from "@/lib/api-response";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<null>>> {
  if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  ) {
    throw new Error("Missing Supabase environment variables");
  }

  const { email, full_name, username, department, permissions } =
    await req.json();

  switch (true) {
    case !email:
      return NextResponse.json(error("Email is required", 400), {
        status: 400,
      });
    case !full_name:
      return NextResponse.json(error("Full name is required", 400), {
        status: 400,
      });
    case !username:
      return NextResponse.json(error("Username is required", 400), {
        status: 400,
      });
    case !department:
      return NextResponse.json(error("Department is required", 400), {
        status: 400,
      });
    case !permissions:
      return NextResponse.json(error("Permissions are required", 400), {
        status: 400,
      });
  }

  const { error: inviteError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name,
        username,
        department,
        permissions,
      },
    });

  if (inviteError) {
    console.error("Error inviting user:", inviteError);
    return NextResponse.json(error(inviteError.message, 500), {
      status: 500,
    });
  }

  return NextResponse.json(
    success(null, "Verification email resent successfully!"),
    {
      status: 200,
    }
  );
}
