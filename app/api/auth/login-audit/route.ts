import { getGeoLocation } from "@/helper/getGeoLocation";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { UAParser } from "ua-parser-js";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { email, method, type, user_id } = await req.json();
  const ip_address = req.headers.get("x-forwarded-for") || "";
  let ua = UAParser(req.headers.get("user-agent") || "");

  const deviceInfo = {
    os: ua.os?.name + " " + ua.os?.version,
    browser: ua.browser?.name + " " + ua.browser?.version,
    device: ua.device?.type || "desktop",
  };

  const locationDetails = await getGeoLocation(ip_address);

  const locationInfo = {
    city: locationDetails?.city || "Unknown",
    country: locationDetails?.country || "Unknown",
  };

  const { data, error } = await supabase.from("login_audit_log").insert({
    email,
    method,
    type,
    user_id: user_id || null,
    ip_address,
    device_info: deviceInfo,
    location: locationInfo,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}
