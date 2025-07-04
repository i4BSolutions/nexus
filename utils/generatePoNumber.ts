export function generatePoNumber(latestPoNumber: string): string {
  if (!latestPoNumber) return "PO-100000";

  const [prefix, year, numberStr] = latestPoNumber.split("-");

  const number = parseInt(numberStr, 10);
  const next = number + 1;

  return `${prefix}-${year}-${next.toString()}`;
}
