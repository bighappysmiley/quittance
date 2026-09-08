import type { Entry, LedgerState, Person } from "./types";
import { DEFAULT_PREFERENCES } from "./types";

const people: Person[] = [
  { id: "p-mommy", name: "Mommy", color: "#E8A0BF" },
  { id: "p-dovid", name: "Dovid Renzoni", color: "#7BA3D4" },
  { id: "p-yitzchok", name: "Yitzchok Fireworker", color: "#6B9BD1" },
  { id: "p-sara", name: "Sara Klein", color: "#9B8EC4" },
  { id: "p-avi", name: "Avi Cohen", color: "#5DAA8A" },
  { id: "p-lea", name: "Lea Berg", color: "#D4A574" },
  { id: "p-moshe", name: "Moshe Weiss", color: "#6A8FAF" },
  { id: "p-rivka", name: "Rivka Gold", color: "#C98B9A" },
];

const entries: Entry[] = [
  {
    id: "e-mommy-50",
    personId: "p-mommy",
    direction: "borrow",
    assetType: "money",
    amount: 50,
    paid: 10,
    date: "2026-09-05",
    settled: false,
    createdAt: "2026-09-05T14:20:00.000Z",
  },
  {
    id: "e-dovid-12",
    personId: "p-dovid",
    direction: "lend",
    assetType: "money",
    amount: 12,
    paid: 10,
    date: "2026-09-04",
    settled: false,
    createdAt: "2026-09-04T18:05:00.000Z",
  },
  {
    id: "e-yitz-lego",
    personId: "p-yitzchok",
    direction: "lend",
    assetType: "item",
    amount: 0,
    paid: 0,
    itemName: "LEGO House",
    category: "toy",
    date: "2026-08-16",
    expectedBack: "2026-09-16",
    settled: false,
    createdAt: "2026-08-16T12:00:00.000Z",
  },
  {
    id: "e-sara-settled",
    personId: "p-sara",
    direction: "lend",
    assetType: "money",
    amount: 25,
    paid: 25,
    date: "2026-06-10",
    settled: true,
    settledAt: "2026-08-14",
    createdAt: "2026-06-10T09:00:00.000Z",
  },
];

export function createSeedLedger(): LedgerState {
  return {
    people: structuredClone(people),
    entries: structuredClone(entries),
    preferences: { ...DEFAULT_PREFERENCES },
  };
}

export function createEmptyLedger(): LedgerState {
  return {
    people: [],
    entries: [],
    preferences: { ...DEFAULT_PREFERENCES },
  };
}
