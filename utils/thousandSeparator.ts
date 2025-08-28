export function formatWithThousandSeparator(
  value: number | string | undefined
): string {
  if (value === null || value === undefined || value === "") return "";

  const num = typeof value === "string" ? Number(value) : value;
  if (isNaN(num)) return String(value);

  // Always round to 2 decimals (fixed), but drop decimals if unnecessary
  const rounded = Number(num.toFixed(2));

  return rounded.toLocaleString("en-US", {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}
