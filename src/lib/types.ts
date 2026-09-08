export type Direction = "lend" | "borrow";
export type AssetType = "money" | "item";
export type ThemeMode = "auto" | "light" | "dark";
export type ListDensity = "compact" | "comfortable" | "spacious";
export type LedgerFilter = "all" | "lent" | "borrowed";
export type SortMode = "recent" | "amount" | "name";
export type ReminderOption = "none" | "tomorrow" | "week" | "custom";

export type AccentId =
  | "gold"
  | "blue"
  | "green"
  | "purple"
  | "pink"
  | "gray";

export type CurrencyCode =
  | "USD"
  | "ILS"
  | "EUR"
  | "GBP"
  | "CAD"
  | "AUD"
  | "JPY"
  | "INR";

export interface Person {
  id: string;
  name: string;
  color: string;
}

export interface Entry {
  id: string;
  personId: string;
  direction: Direction;
  assetType: AssetType;
  /** Amount in major currency units; ignored for items */
  amount: number;
  /** Optional partial payments already made */
  paid: number;
  itemName?: string;
  category?: string;
  photoDataUrl?: string;
  note?: string;
  date: string; // ISO date
  expectedBack?: string; // ISO date
  reminder?: ReminderOption;
  reminderDate?: string;
  settled: boolean;
  settledAt?: string;
  createdAt: string;
}

export interface Preferences {
  theme: ThemeMode;
  accent: AccentId;
  currency: CurrencyCode;
  density: ListDensity;
  confirmActions: boolean;
}

export interface Account {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface LedgerState {
  people: Person[];
  entries: Entry[];
  preferences: Preferences;
}

export const ACCENTS: Record<
  AccentId,
  { label: string; value: string; soft: string }
> = {
  gold: { label: "Gold", value: "#C4A035", soft: "#F5E9C0" },
  blue: { label: "Blue", value: "#3B7DD8", soft: "#D6E6F8" },
  green: { label: "Green", value: "#2F9B6A", soft: "#D7F0E4" },
  purple: { label: "Purple", value: "#8B6BC9", soft: "#E8DEF8" },
  pink: { label: "Pink", value: "#D45B8C", soft: "#F8D9E6" },
  gray: { label: "Gray", value: "#6B7280", soft: "#E5E7EB" },
};

export const CURRENCIES: {
  code: CurrencyCode;
  symbol: string;
  label: string;
}[] = [
  { code: "USD", symbol: "$", label: "USD" },
  { code: "ILS", symbol: "₪", label: "ILS" },
  { code: "EUR", symbol: "€", label: "EUR" },
  { code: "GBP", symbol: "£", label: "GBP" },
  { code: "CAD", symbol: "C$", label: "CAD" },
  { code: "AUD", symbol: "A$", label: "AUD" },
  { code: "JPY", symbol: "¥", label: "JPY" },
  { code: "INR", symbol: "₹", label: "INR" },
];

export const ITEM_CATEGORIES = [
  { id: "toy", label: "Toy" },
  { id: "electronics", label: "Electronics" },
  { id: "tools", label: "Tools" },
  { id: "clothing", label: "Clothing" },
  { id: "books", label: "Books" },
  { id: "other", label: "Other" },
] as const;

export const DEFAULT_PREFERENCES: Preferences = {
  theme: "light",
  accent: "green",
  currency: "USD",
  density: "compact",
  confirmActions: true,
};
