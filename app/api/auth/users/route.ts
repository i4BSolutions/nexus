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

import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, full_name, username, department, permissions } =
      await req.json();

    // permissions: {
    //   can_read_purchase_orders: true,
    //   can_manage_purchase_orders: true,
    //   can_read_invoices: true,
    //   can_manage_invoices: true,
    //   can_read_products_suppliers: true,
    //   can_manage_products_suppliers: true,
    //   can_read_stock: true,
    //   can_stock_in: true,
    //   can_stock_out: true,
    //   can_read_warehouses: true,
    //   can_manage_warehouses: true,
    //   can_read_budget_allocations: true,
    //   can_manage_budget_allocations: true,
    //   can_read_dashboard: true,
    //   can_manage_users: true,
    // },

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

    const { data: authUserData, error: authUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        user_metadata: {
          full_name,
          username,
          department,
          permissions,
        },
      });

    if (authUserError) {
      console.log("Create auth user error:", authUserError);
      return NextResponse.json(
        { error: authUserError.message },
        { status: 500 }
      );
    }

    // const supabase = await createClient();

    // Insert into profiles table
    const { data: profileUserData, error: profileUserError } =
      await supabaseAdmin.from("profiles").insert({
        id: authUserData.user.id,
        email: authUserData.user.email,
        full_name,
        username,
        department,
        permissions,
      });

    if (profileUserError) {
      console.log("Insert profile error:", profileUserError);
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
