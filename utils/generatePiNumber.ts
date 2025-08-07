export function generatePiNumber(latestPiNumber: string): string {
  if (!latestPiNumber) return "INV-100000";

  const [prefix, year, numberStr] = latestPiNumber.split("-");

  const number = parseInt(numberStr, 10);
  const next = number + 1;

  return `${prefix}-${year}-${next.toString()}`;
}
