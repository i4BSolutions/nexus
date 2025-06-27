import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { UAParser } from "ua-parser-js";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { email, method } = await req.json();
  const ip_address = req.headers.get("x-forwarded-for") || null;
  let ua = UAParser(req.headers.get("user-agent") || "");

  const deviceInfo = {
    os: ua.os?.name + " " + ua.os?.version,
    browser: ua.browser?.name + " " + ua.browser?.version,
    device: ua.device?.type || "desktop",
  };

  const { data, error } = await supabase.from("login_audit_log").insert({
    email,
    method,
    ip_address,
    device_info: deviceInfo,
  });

  console.log("Login audit data:", data);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}
