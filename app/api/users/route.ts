import { error, success } from "@/lib/api-response";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types/shared/api-response-type";
import { UsersResponse } from "@/types/user/user.type";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles the creation of a new user in the system.
 *
 * @param req - The HTTP request object containing the user details in JSON format.
 * @returns A JSON response indicating success or failure of the operation.
 *
 * The request body should include the following fields:
 * - `email` (string): The email address of the user. Required.
 * - `full_name` (string): The full name of the user. Required.
 * - `username` (string): The username of the user. Required.
 * - `department` (string): The department the user belongs to. Required.
 * - `permissions` (object): An object containing the user's permissions. Required.
 * * The type of permissions can include:
 *   - `can_read_purchase_orders`
 *   - `can_manage_purchase_orders`
 *   - `can_read_invoices`
 *   - `can_manage_invoices`
 *   - `can_read_products_suppliers`
 *   - `can_manage_products_suppliers`
 *   - `can_read_stock`
 *   - `can_stock_in`
 *   - `can_stock_out`
 *   - `can_read_warehouses`
 *   - `can_manage_warehouses`
 *   - `can_read_budget_allocations`
 *   - `can_manage_budget_allocations`
 *   - `can_read_dashboard`
 *   - `can_manage_users`
 */

export async function POST(req: Request) {
  try {
    const { email, full_name, username, department, permissions } =
      await req.json();

    if (
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL
    ) {
      throw new Error("Missing Supabase environment variables");
    }

    switch (true) {
      case !email:
        return NextResponse.json(
          { error: "Email is required" },
          { status: 400 }
        );
      case !full_name:
        return NextResponse.json(
          { error: "Full name is required" },
          { status: 400 }
        );
      case !username:
        return NextResponse.json(
          { error: "Username is required" },
          { status: 400 }
        );
      case !department:
        return NextResponse.json(
          { error: "Department is required" },
          { status: 400 }
        );
      case !permissions:
        return NextResponse.json(
          { error: "Permissions are required" },
          { status: 400 }
        );
    }

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();

    const userExists = existingUsers?.users.find(
      (user) => user.email === email
    );

    if (userExists) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const { data: authUserData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name,
          username,
          department,
          permissions,
        },
      });
    if (inviteError) {
      console.log("Invite user error:", inviteError);
      return NextResponse.json({ error: inviteError.message }, { status: 500 });
    }

    const supabase = await createClient();

    // Insert into user_profiles table
    const { data: profileUserData, error: profileUserError } = await supabase
      .from("user_profiles")
      .insert({
        id: authUserData.user.id,
        email: authUserData.user.email,
        full_name,
        username,
        department,
        permissions,
      });

    if (profileUserError) {
      console.log("Insert profile user error:", profileUserError);
      await supabaseAdmin.auth.admin.deleteUser(authUserData.user.id);
      return NextResponse.json(
        { error: profileUserError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { authUserData, profileUserData },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<UsersResponse> | ApiResponse<null>>> {
  const { searchParams } = new URL(req.url);

  // pagination
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSizeParam = searchParams.get("pageSize") || "10";
  const pageSize = parseInt(pageSizeParam, 10);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const filterParams = searchParams.get("department");
  const search = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort");

  const supabase = await createClient();
  let query = supabase.from("user_profiles").select("*", { count: "exact" });

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  if (filterParams) {
    query = query.eq("department", parseInt(filterParams, 10));
  }

  query = query.order("created_at", {
    ascending: sortParam === "created_at_asc",
  });

  if (typeof to === "number") {
    query = query.range(from, to);
  }

  const { data, count, error: usersError } = await query;

  if (usersError) {
    return NextResponse.json(
      error("Failed to retrieve users: " + usersError.message, 500),
      { status: 500 }
    );
  }

  const userProfiles =
    data?.map((user) => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      username: user.username,
      department: user.department,
      created_at: user.created_at,
    })) || [];

  const response = {
    dto: userProfiles,
    total: count || 0,
    page,
    pageSize,
  };

  return NextResponse.json(
    success<UsersResponse>(response, "Users retrieved successfully"),
    {
      status: 200,
    }
  );
}
