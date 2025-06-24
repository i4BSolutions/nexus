export const generateSKU = (lastSku: string | null, prefix = "AA-"): string => {
  if (!lastSku) return `${prefix}00001`;
  const match = lastSku.match(/^.+-(\d{5})$/);
  const nextNumber = match ? parseInt(match[1]) + 1 : 1;
  return `${prefix}${String(nextNumber).padStart(5, "0")}`;
};
