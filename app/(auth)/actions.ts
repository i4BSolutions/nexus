"use server";

import { createClient } from "@/lib/supabase/server";

export async function signInWithOtp(email: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function verfiyOtp(
  email: string,
  code: string,
  isAdmin: boolean = false
) {
  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "email",
  });

  if (error) {
    throw new Error(error.message);
  }

  if (isAdmin) {
    const { data, error: updateError } = await supabase.auth.updateUser({
      data: {
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
      },
    });
    if (updateError) {
      throw new Error(updateError.message);
    }

    const { error } = await supabase.from("public.profiles").insert({
      id: session?.user.id,
      email: session?.user.email,
      role_name: "ADMIN",
      data: {
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
      },
    });
    if (error) {
      throw new Error(error.message);
    }
  }

  return session;
}
