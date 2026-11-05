import type { CircleMember, ExpiryStatus, FoodCategory, ISODate, PantryItem } from '../types/models';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_MS = 86_400_000;

export function createId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function toISODate(date: Date): ISODate {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function today(): ISODate {
  return toISODate(new Date());
}

export function addDays(iso: ISODate, days: number): ISODate {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function daysFromNow(days: number): ISODate {
  return addDays(today(), days);
}

export function monthStart(monthsAgo: number): ISODate {
  const now = new Date();
  return toISODate(new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1));
}

export function daysUntilExpiry(item: Pick<PantryItem, 'expiresOn'>, from: ISODate = today()): number {
  return Math.round((parseISODate(item.expiresOn).getTime() - parseISODate(from).getTime()) / DAY_MS);
}

export function expiryStatus(item: Pick<PantryItem, 'expiresOn'>, soonThresholdDays = 3): ExpiryStatus {
  const days = daysUntilExpiry(item);
  if (days < 0) return 'expired';
  return days <= soonThresholdDays ? 'soon' : 'fresh';
}

export function expiryLabel(item: Pick<PantryItem, 'expiresOn'>): string {
  const days = daysUntilExpiry(item);
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days}d`;
}

export function formatDate(iso: ISODate): string {
  const date = parseISODate(iso);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatMonth(iso: ISODate): string {
  return MONTHS[parseISODate(iso).getMonth()];
}

export function formatQuantity(n: number): string {
  return String(Number(n.toFixed(2)));
}

export function formatCurrency(n: number): string {
  return `${n < 0 ? '-' : ''}$${Math.abs(n).toFixed(2)}`;
}

export function formatPercent(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export function categoryName(category: FoodCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function initials(member: CircleMember): string {
  return member.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
}

export function sameName(a: string, b: string): boolean {
  return a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;
}
