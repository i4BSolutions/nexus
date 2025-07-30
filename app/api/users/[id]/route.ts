import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/shared/api-response-type";
import { UserDetailResponse } from "@/types/user/user-detail.type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<UserDetailResponse | null>>> {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(error("Invalid user ID", 400), {
      status: 400,
    });
  }

  const supabase = await createClient();

  const { data, error: dbError } = await supabase
    .from("user_profiles")
    .select(
      `
        full_name,
        username,
        email,
        department:departments(id, name),
        permissions,
        created_at,
        updated_at
        `
    )
    .eq("id", id)
    .single<UserDetailResponse>();

  if (dbError || !data) {
    return NextResponse.json(error("User not found", 404), {
      status: 404,
    });
  }

  const userDetail: UserDetailResponse = {
    full_name: data.full_name,
    username: data.username,
    email: data.email,
    department: {
      id: data.department.id,
      name: data.department.name,
    },
    permissions: data.permissions,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };

  return NextResponse.json(
    success(userDetail, "User retrieved successfully", 200),
    {
      status: 200,
    }
  );
}
