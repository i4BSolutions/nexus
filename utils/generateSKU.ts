export function generateSKU(latestSku: string | null): string {
  if (!latestSku) return "AA-100000";

  const [prefix, numberStr] = latestSku.split("-");
  const number = parseInt(numberStr, 10);
  const next = number + 1;

  return `${prefix}-${next.toString()}`;
}
