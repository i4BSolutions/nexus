import { ExportColumn } from "@/components/purchase-orders/PurchaseOrderExportCSVModal";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export function exportPOToCsv<T extends Record<string, any>>(
  rows: T[],
  columns: ExportColumn[],
  filename: string
) {
  if (!columns.length) return;

  const header = columns.map((c) => c.label).join(",");

  const csvRows = rows.map((row) =>
    columns
      .map((c) => {
        let val = row[c.key] ?? "";

        // Format dates consistently
        if (c.key === "order_date" || c.key === "expected_delivery_date") {
          val = dayjs(val, ["MMM D, YYYY", "YYYY-MM-DD"]).isValid()
            ? dayjs(val, ["MMM D, YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD")
            : val;
        }

        // Quote strings safely
        if (typeof val === "string") {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      })
      .join(",")
  );

  const csvContent = [header, ...csvRows].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
