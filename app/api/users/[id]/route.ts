import { getGeoLocation } from "@/helper/getGeoLocation";
import { error, success } from "@/lib/api-response";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/shared/api-response-type";
import { UserDetailResponse } from "@/types/user/user-detail.type";
import { NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";

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
      ` id,
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
    id: data.id,
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

  const { initialPayload, updatePayload, logPayload } = await req.json();
  const updateData = {
    ...updatePayload,
    updated_at: new Date().toISOString(),
  };

  const { error: adminErr } = await supabaseAdmin.auth.admin.updateUserById(
    idStr,
    {
      user_metadata: updateData,
    }
  );

  if (adminErr) {
    return NextResponse.json(error(adminErr.message, 400), { status: 400 });
  }

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

  const ip_address = req.headers.get("x-forwarded-for") || "";
  let ua = UAParser(req.headers.get("user-agent") || "");

  const locationDetails = await getGeoLocation(ip_address);

  const changedSet = Object.keys(updatePayload).reduce((diff, key) => {
    const before = initialPayload?.[key];
    const after = updatePayload?.[key];

    if (
      key === "permissions" &&
      before &&
      after &&
      typeof before === "object" &&
      typeof after === "object"
    ) {
      const permDiff = Object.keys({ ...before, ...after }).reduce((acc, k) => {
        if (before[k] !== after[k]) {
          acc[k] = { before: before[k] ?? null, after: after[k] ?? null };
        }
        return acc;
      }, {} as Record<string, { before: any; after: any }>);

      if (Object.keys(permDiff).length) {
        (diff as any).permissions = permDiff;
      }
      return diff;
    }

    if (JSON.stringify(before) !== JSON.stringify(after)) {
      (diff as any)[key] = { before: before ?? null, after: after ?? null };
    }
    return diff;
  }, {} as Record<string, any>);

  const { error: logError } = await supabase.from("user_audit_log").insert({
    actor: logPayload.actor,
    target: logPayload.target,
    target_id: logPayload.target_id,
    changed_set: changedSet,
    ip_address: ip_address,
    device: ua.device?.type || "Unknown",
    location: locationDetails
      ? locationDetails?.city + ", " + locationDetails?.country
      : "Unknown",
  });

  if (logError) {
    return NextResponse.json(error(logError.message, 400), {
      status: 400,
    });
  }

  return NextResponse.json(success(updatedUser, "User updated successfully"), {
    status: 200,
  });
}
