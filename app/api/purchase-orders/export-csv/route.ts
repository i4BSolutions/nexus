import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { error, success } from "@/lib/api-response";
import dayjs from "dayjs";

function csvCell(val: string | null | undefined): string {
  const s = val ?? "";
  const needsQuote = /[",\r\n]/.test(s);
  return needsQuote ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();

  const { columns, filters } = body;

  // Permission check
  const { data: user } = await supabase.auth.getUser();
  const permissions = (user?.user?.app_metadata?.permissions || []) as string[];
  if (!permissions.includes("can_manage_purchase_orders")) {
    return NextResponse.json(error("Forbidden"), { status: 403 });
  }

  // Build query
  let query = supabase.from("purchase_order").select(`
      id,
      purchase_order_no,
      order_date,
      expected_delivery_date,
      status,
      usd_exchange_rate,
      note,
      region:region_id(name),
      supplier:supplier_id(name),
      currency:currency_id(currency_code),
      person:contact_person_id(name)
    `);

  if (filters?.dateFrom) query = query.gte("order_date", filters.dateFrom);
  if (filters?.dateTo) query = query.lte("order_date", filters.dateTo);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.region) query = query.eq("region_id", filters.region);
  if (filters?.currency) query = query.eq("currency_id", filters.currency);

  const { data, error: qError } = await query.limit(50001);
  if (qError) return NextResponse.json(error(qError.message), { status: 500 });
  if (!data) return NextResponse.json(error("No data"), { status: 404 });
  if (data.length > 50000) {
    return NextResponse.json(error("Row limit (50k) exceeded"), {
      status: 413,
    });
  }

  // Build CSV
  const headers = columns.map((c: any) => c.label);
  let csv = "\uFEFF" + headers.join(",") + "\r\n";

  for (const row of data) {
    const line = columns
      .map((c: any) => {
        switch (c.key) {
          case "purchase_order_no":
            return csvCell(row.purchase_order_no);
          case "order_date":
            return csvCell(row.order_date);
          case "expected_delivery_date":
            return csvCell(row.expected_delivery_date);
          case "contact_person":
            return csvCell(row.person[0]?.name ?? "");
          case "supplier":
            return csvCell(row.supplier[0]?.name ?? "");
          case "region":
            return csvCell(row.region[0]?.name ?? "");
          case "currency":
            return csvCell(row.currency[0]?.currency_code ?? "");
          case "status":
            return csvCell(row.status);
          case "usd_exchange_rate":
            return csvCell(String(row.usd_exchange_rate));
          default:
            return "";
        }
      })
      .join(",");
    csv += line + "\r\n";
  }

  const filename = `purchase_orders_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
