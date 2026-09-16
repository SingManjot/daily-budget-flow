export function formatMoney(amount: number, currency = "₹"): string {
  const rounded = Math.round(Math.abs(amount));
  return `${currency}${rounded.toLocaleString("en-IN")}`;
}

export function formatCompact(amount: number, currency = "₹"): string {
  const a = Math.abs(amount);
  if (a >= 100000) return `${currency}${(a / 100000).toFixed(a >= 1000000 ? 0 : 1)}L`;
  if (a >= 1000) return `${currency}${(a / 1000).toFixed(a >= 10000 ? 0 : 1)}k`;
  return `${currency}${Math.round(a)}`;
}
