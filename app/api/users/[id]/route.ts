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

  const { data: auditLogData, error: auditLogError } = await supabase
    .from("login_audit_log")
    .select("*")
    .eq("user_id", id);

  if (auditLogError) {
    return NextResponse.json(error("Failed to retrieve audit log", 500), {
      status: 500,
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
    login_audit_log: auditLogData?.map((log) => ({
      id: log.id,
      ip_address: log.ip_address,
      city: log.location.city,
      country: log.location.country,
      device: log.device_info.device,
      browser: log.device_info.browser,
      created_at: log.created_at,
    })),
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

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<UserDetailResponse | null>>> {
  const supabase = await createClient();

  const { id: idStr } = await context.params;

  if (!idStr) {
    return NextResponse.json(error("Invalid user ID", 400), {
      status: 400,
    });
  }

  const body = await req.json();

  const updateData = {
    ...body,
    updated_at: new Date().toISOString(),
  };

  const { data: updatedUser, error: updateError } = await supabase
    .from("user_profiles")
    .update(updateData)
    .eq("id", idStr)
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
    .single<UserDetailResponse>();

  if (updateError) {
    return NextResponse.json(error(updateError.message, 400), {
      status: 400,
    });
  }

  return NextResponse.json(
    success(updatedUser, "Supplier updated successfully"),
    {
      status: 200,
    }
  );
}
