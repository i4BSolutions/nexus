const escapeCSV = (val: any) => {
  if (val === null || val === undefined) return "";
  const s = String(val);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const toCSV = (rows: any[]) => {
  const headers = [
    "purchase_order_number",
    "order_date",
    "region",
    "contact_person",
    "currency_code",
    "unit_price_local",
    "exchange_rate",
    "unit_price_usd",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.purchase_order_number,
        r.order_date,
        r.region,
        r.contact_person,
        r.currency_code ?? "",
        r.unit_price_local,
        r.exchange_rate,
        r.unit_price_usd,
      ]
        .map(escapeCSV)
        .join(",")
    ),
  ];
  // Add BOM for Excel
  return "\uFEFF" + lines.join("\n");
};

export const downloadBlob = (
  content: string,
  filename: string,
  type = "text/csv;charset=utf-8"
) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
