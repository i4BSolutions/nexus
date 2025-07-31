import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { UAParser } from "ua-parser-js";

async function getGeoLocation(ip?: string) {
  if (!ip || ip === "127.0.0.1" || ip === "::1") return null;
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { "User-Agent": "Next.js Server" },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Geo API error", res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    console.log("Geo API raw response:", data);

    if (!data.city && !data.country_name) return null;

    return {
      city: data.city,
      region: data.region,
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (err) {
    console.error("Geo API fetch failed:", err);
    return null;
  }
}

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
