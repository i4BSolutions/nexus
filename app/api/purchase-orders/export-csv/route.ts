import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const body = await req.json();
  const { filters, columns } = body;

  // Build dynamic where clause
  const conditions: string[] = [];
  if (filters.dateFrom && filters.dateTo) {
    conditions.push(
      `po.order_date BETWEEN '${filters.dateFrom}' AND '${filters.dateTo}'`
    );
  }
  if (filters.region) {
    conditions.push(`po.region = '${filters.region}'`);
  }
  if (filters.status) {
    conditions.push(`po.purchase_order_smart_status = '${filters.status}'`);
  }
  if (filters.currency) {
    conditions.push(`po.currency_code = '${filters.currency}'`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  // Build SQL query
  const { data, error } = await (
    await supabase
  ).rpc("export_purchase_orders", {
    where_clause: whereClause,
  });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}
