import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "./admin";

const routePermissions: Record<string, string> = {
  "/purchase-orders": "can_view_purchase_orders",
  "/invoices": "can_view_invoices",
  "/budgets": "can_view_budgets_allocations",
  "/budget-allocations": "can_view_budgets_allocations",
  "/stock-management": "can_view_stock",
  "/warehouses": "can_view_warehouses",
  "/users": "can_manage_users",
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const publicUrls = [
    "/login",
    "/verify-otp",
    "/api/auth/verify-otp",
    "/api/auth/callback",
    "/api/auth/check-user",
    "/api/auth/login-audit",
  ];

  if (
    !user &&
    !publicUrls.some((url) => request.nextUrl.pathname.startsWith(url))
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && user.user_metadata.permissions === undefined) {
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const bannedUntil = user.user_metadata.banned_until
      ? new Date(user.user_metadata.banned_until)
      : null;
    const isBanned = !!bannedUntil && bannedUntil > new Date();
    if (isBanned) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const pathname = request.nextUrl.pathname;

    const permissions = user.user_metadata?.permissions || {};

    for (const [route, permission] of Object.entries(routePermissions)) {
      if (pathname.startsWith(route) && !permissions[permission]) {
        const url = request.nextUrl.clone();
        url.pathname = "/unauthorized";
        const response = NextResponse.redirect(url);
        for (const cookie of supabaseResponse.cookies.getAll()) {
          response.cookies.set(cookie);
        }
        return response;
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!
  return supabaseResponse;
}
