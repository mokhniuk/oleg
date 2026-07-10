/** True when a hex colour is dark enough to need light text on top. */
export function isDarkColor(hex?: string): boolean {
  if (!hex) return false;
  const c = hex.replace("#", "").trim();
  if (c.length < 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return false;
  // Rec. 601 luma
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}
