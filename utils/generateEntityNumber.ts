function generateEntityNumber(
  latestNumber: string,
  zeroCount: number = 4
): string {
  const currentYear = new Date().getUTCFullYear();

  const [prefix, year, numberStr] = latestNumber.split("-");

  if (currentYear !== Number(year)) {
    return `${prefix}-${currentYear}-${"1"
      .toString()
      .padStart(zeroCount, "0")}`;
  }

  const number = parseInt(numberStr, 10);
  const next = number + 1;

  return `${prefix}-${year}-${next.toString().padStart(zeroCount, "0")}`;
}
