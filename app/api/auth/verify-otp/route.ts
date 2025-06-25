import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, code, isAdmin } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Missing email or code" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { session },
      error: otpError,
    } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (otpError || !session) {
      return NextResponse.json(
        { error: otpError?.message || "Invalid OTP" },
        { status: 401 }
      );
    }

    // Admin setup logic
    if (isAdmin) {
      const adminData = {
        name: "Super Admin",
        role_name: "ADMIN",
        permissions: {
          can_read_purchase_orders: true,
          can_write_purchase_orders: true,
          can_read_invoices: true,
          can_write_invoices: true,
          can_read_products: true,
          can_write_products: true,
          can_read_stock: true,
          can_stock_in: true,
          can_stock_out: true,
          can_read_warehouses: true,
          can_write_warehouses: true,
          can_read_budgets: true,
          can_write_budgets: true,
          can_read_budget_allocations: true,
          can_write_budget_allocations: true,
          can_read_dashboard: true,
          can_manage_users: true,
        },
      };

      const { error: updateError } = await supabase.auth.updateUser({
        data: adminData,
      });

      if (updateError) {
        console.log("Update user error:", updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }

      // Insert into profiles table
      const { error: insertError } = await supabase.from("profiles").insert({
        id: session.user.id,
        email: session.user.email,
        ...adminData,
      });

      if (insertError) {
        console.log("Insert profile error:", insertError);
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ session });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
