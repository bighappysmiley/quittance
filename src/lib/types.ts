export type Direction = "lend" | "borrow";
export type AssetType = "money" | "item";
export type ThemeMode = "auto" | "light" | "dark";
export type ListDensity = "compact" | "comfortable" | "spacious";
export type LedgerFilter = "all" | "lent" | "borrowed";
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
  amount: number;
  paid: number;
  itemName?: string;
  category?: string;
  photoDataUrl?: string;
  note?: string;
  date: string;
  expectedBack?: string;
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

export interface LedgerState {
  people: Person[];
  entries: Entry[];
  preferences: Preferences;
}

export const ACCENTS: Record<
  AccentId,
  { label: string; value: string; soft: string }
> = {
  gold: { label: "Gold", value: "#A67C2D", soft: "#F3E7C7" },
  blue: { label: "Blue", value: "#2F6FED", soft: "#D9E6FF" },
  green: { label: "Teal", value: "#156B5C", soft: "#D3EDE7" },
  purple: { label: "Plum", value: "#6B4F8A", soft: "#E8DFF0" },
  pink: { label: "Rose", value: "#B04A6A", soft: "#F4D9E3" },
  gray: { label: "Slate", value: "#4B5563", soft: "#E5E7EB" },
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
  density: "comfortable",
  confirmActions: true,
};
