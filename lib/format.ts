/**
 * The one place currency is decided. Switching market is these two values.
 *
 * Deliberately not Intl.NumberFormat: Hermes ships Intl inconsistently across platforms and
 * money is the figure the user is deciding on, so it must render identically everywhere.
 */
const CURRENCY = { symbol: '$', group: ',' } as const;

/** Whole currency units, grouped. Money is never shown with cents in this product. */
export function formatMoney(value: number): string {
  const rounded = Math.round(value);
  const digits = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, CURRENCY.group);
  return `${rounded < 0 ? '−' : ''}${CURRENCY.symbol}${digits}`;
}

const DAY_MS = 86_400_000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "Today" / "Yesterday" / "N days ago" — co-pilot voice. */
export function formatDetectedAt(iso: string, now: Date = new Date()): string {
  const days = Math.round((startOfDay(now) - startOfDay(new Date(iso))) / DAY_MS);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}
