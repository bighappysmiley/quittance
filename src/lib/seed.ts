import type { Entry, LedgerState, Person, Preferences } from "@/lib/types";
import { DEFAULT_PREFERENCES } from "@/lib/types";
import { sanitizePreferences } from "@/lib/safe";

/** Fictional sample contacts — not real people */
export const DEMO_PEOPLE: Omit<Person, "id">[] = [
  { name: "Alex Chen", color: "#4F7CAC" },
  { name: "Jordan Blake", color: "#5B8C5A" },
  { name: "Riley Nguyen", color: "#8B6D9C" },
  { name: "Morgan Ellis", color: "#C17B4A" },
];

export function buildDemoLedger(): LedgerState {
  const people: Person[] = DEMO_PEOPLE.map((p, i) => ({
    ...p,
    id: `demo-p-${i + 1}`,
  }));

  const entries: Entry[] = [
    {
      id: "demo-e-1",
      personId: people[0].id,
      direction: "lend",
      assetType: "money",
      amount: 40,
      paid: 15,
      date: daysAgo(6),
      settled: false,
      createdAt: daysAgoIso(6),
    },
    {
      id: "demo-e-2",
      personId: people[1].id,
      direction: "borrow",
      assetType: "money",
      amount: 25,
      paid: 0,
      date: daysAgo(3),
      settled: false,
      createdAt: daysAgoIso(3),
    },
    {
      id: "demo-e-3",
      personId: people[2].id,
      direction: "lend",
      assetType: "item",
      amount: 0,
      paid: 0,
      itemName: "Camping tent",
      category: "other",
      date: daysAgo(18),
      expectedBack: daysAhead(12),
      settled: false,
      createdAt: daysAgoIso(18),
    },
    {
      id: "demo-e-4",
      personId: people[3].id,
      direction: "lend",
      assetType: "money",
      amount: 60,
      paid: 60,
      date: daysAgo(45),
      settled: true,
      settledAt: daysAgo(12),
      createdAt: daysAgoIso(45),
    },
  ];

  return {
    people,
    entries,
    preferences: { ...DEFAULT_PREFERENCES },
  };
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function daysAhead(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function daysAgoIso(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export type PreferencesRow = Preferences & { user_id: string };

export function mapPerson(row: {
  id: string;
  name: string;
  color: string;
}): Person {
  return { id: row.id, name: row.name, color: row.color };
}

export function mapEntry(row: Record<string, unknown>): Entry {
  return {
    id: String(row.id),
    personId: String(row.person_id),
    direction: row.direction as Entry["direction"],
    assetType: row.asset_type as Entry["assetType"],
    amount: Number(row.amount),
    paid: Number(row.paid),
    itemName: (row.item_name as string) || undefined,
    category: (row.category as string) || undefined,
    note: (row.note as string) || undefined,
    date: String(row.date).slice(0, 10),
    expectedBack: row.expected_back
      ? String(row.expected_back).slice(0, 10)
      : undefined,
    reminder: (row.reminder as Entry["reminder"]) || undefined,
    settled: Boolean(row.settled),
    settledAt: row.settled_at ? String(row.settled_at).slice(0, 10) : undefined,
    createdAt: String(row.created_at),
  };
}

export function mapPreferences(row: Record<string, unknown> | undefined): Preferences {
  if (!row) return { ...DEFAULT_PREFERENCES };
  return sanitizePreferences({
    theme: row.theme,
    accent: row.accent,
    currency: row.currency,
    density: row.density,
    confirm_actions: row.confirm_actions,
  });
}
