import { format, formatDistanceToNowStrict, parseISO, differenceInDays } from "date-fns";
import { CURRENCIES, type CurrencyCode, type Entry, type Person } from "./types";

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function currencySymbol(code: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";
}

export function formatMoney(
  amount: number,
  code: CurrencyCode,
  opts?: { signed?: boolean; forceSign?: boolean },
): string {
  const symbol = currencySymbol(code);
  const abs = Math.abs(amount);
  const formatted =
    Number.isInteger(abs) ? `${symbol}${abs}` : `${symbol}${abs.toFixed(2)}`;
  if (!opts?.signed && !opts?.forceSign) return formatted;
  if (amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return opts?.forceSign ? `+${formatted}` : formatted;
}

export function remainingBalance(entry: Entry): number {
  if (entry.assetType === "item") return entry.settled ? 0 : 1;
  return Math.max(0, entry.amount - entry.paid);
}

/** Positive = owed to you, negative = you owe */
export function signedOutstanding(entry: Entry): number {
  if (entry.settled) return 0;
  if (entry.assetType === "item") return 0;
  const rem = remainingBalance(entry);
  return entry.direction === "lend" ? rem : -rem;
}

export function entryDisplayAmount(
  entry: Entry,
  code: CurrencyCode,
): { text: string; tone: "lend" | "borrow" | "neutral" } {
  if (entry.assetType === "item") {
    const name = entry.itemName || "Item";
    return {
      text: entry.direction === "lend" ? `+${name}` : `−${name}`,
      tone: entry.direction === "lend" ? "lend" : "borrow",
    };
  }
  const signed = signedOutstanding(entry);
  return {
    text: formatMoney(signed, code, { signed: true }),
    tone: signed > 0 ? "lend" : signed < 0 ? "borrow" : "neutral",
  };
}

export function relativeDateLabel(iso: string): string {
  const d = parseISO(iso);
  const days = differenceInDays(new Date(), d);
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 14) return `${days} days ago`;
  return format(d, "MMM d");
}

export function activitySentence(
  entry: Entry,
  person: Person | undefined,
  code: CurrencyCode,
): string {
  const name = person?.name ?? "someone";
  if (entry.assetType === "item") {
    const item = entry.itemName || "an item";
    return entry.direction === "lend"
      ? `You lent ${item} to ${name}`
      : `You borrowed ${item} from ${name}`;
  }
  const amt = formatMoney(entry.amount, code);
  return entry.direction === "lend"
    ? `You lent ${amt} to ${name}`
    : `You borrowed ${amt} from ${name}`;
}

export function formatDayHeader(iso: string): string {
  return format(parseISO(iso), "EEE, MMM d").toUpperCase();
}

export function formatLongDate(iso: string): string {
  return format(parseISO(iso), "MMM d, yyyy");
}

export function todayHeader(): string {
  return format(new Date(), "EEEE, MMMM d").toUpperCase();
}

export function timeAgoShort(iso: string): string {
  return formatDistanceToNowStrict(parseISO(iso), { addSuffix: false });
}
