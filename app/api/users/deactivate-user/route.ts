import { error, success } from "@/lib/api-response";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/shared/api-response-type";
import dayjs from "dayjs";

import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<null>>> {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json(error("Invalid user ID", 400), {
      status: 400,
    });
  }

  if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  ) {
    throw new Error("Missing Supabase environment variables");
  }

  const banned_duration = dayjs().add(70, "year").toISOString();

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    {
      user_metadata: { banned_until: banned_duration },
    }
  );

  if (updateError) {
    return NextResponse.json(error(updateError.message, 500), {
      status: 500,
    });
  }

  const supabase = await createClient();

  const { error: profileUpdateError } = await supabase
    .from("user_profiles")
    .update({
      banned_until: banned_duration,
    })
    .eq("id", userId);

  if (profileUpdateError) {
    return NextResponse.json(error(profileUpdateError.message, 500), {
      status: 500,
    });
  }

  return NextResponse.json(success(null, "User banned successfully", 200), {
    status: 200,
  });
}
