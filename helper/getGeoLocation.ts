export async function getGeoLocation(ip?: string) {
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
