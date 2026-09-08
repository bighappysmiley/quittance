import type { Entry, LedgerState, Person } from "./types";
import { remainingBalance, signedOutstanding } from "./format";

export function getPerson(state: LedgerState, id: string): Person | undefined {
  return state.people.find((p) => p.id === id);
}

export function outstandingEntries(state: LedgerState): Entry[] {
  return state.entries.filter((e) => !e.settled);
}

export function netPosition(state: LedgerState): {
  net: number;
  owedToYou: number;
  youOwe: number;
  owedPeople: number;
  owePeople: number;
} {
  let owedToYou = 0;
  let youOwe = 0;
  const owedSet = new Set<string>();
  const oweSet = new Set<string>();

  for (const e of outstandingEntries(state)) {
    if (e.assetType === "item") {
      if (e.direction === "lend") owedSet.add(e.personId);
      else oweSet.add(e.personId);
      continue;
    }
    const signed = signedOutstanding(e);
    if (signed > 0) {
      owedToYou += signed;
      owedSet.add(e.personId);
    } else if (signed < 0) {
      youOwe += Math.abs(signed);
      oweSet.add(e.personId);
    }
  }

  return {
    net: owedToYou - youOwe,
    owedToYou,
    youOwe,
    owedPeople: owedSet.size,
    owePeople: oweSet.size,
  };
}

/** Aggregate outstanding by person for ledger list */
export function personBalances(state: LedgerState): {
  person: Person;
  entries: Entry[];
  moneySigned: number;
  itemLent: string[];
  itemBorrowed: string[];
  latestDate: string;
  paidTotal: number;
  primaryDirection: "lend" | "borrow" | "mixed";
}[] {
  const map = new Map<
    string,
    {
      person: Person;
      entries: Entry[];
      moneySigned: number;
      itemLent: string[];
      itemBorrowed: string[];
      latestDate: string;
      paidTotal: number;
    }
  >();

  for (const e of outstandingEntries(state)) {
    const person = getPerson(state, e.personId);
    if (!person) continue;
    let row = map.get(person.id);
    if (!row) {
      row = {
        person,
        entries: [],
        moneySigned: 0,
        itemLent: [],
        itemBorrowed: [],
        latestDate: e.date,
        paidTotal: 0,
      };
      map.set(person.id, row);
    }
    row.entries.push(e);
    row.paidTotal += e.paid;
    if (e.date > row.latestDate) row.latestDate = e.date;
    if (e.assetType === "money") {
      row.moneySigned += signedOutstanding(e);
    } else if (e.itemName) {
      if (e.direction === "lend") row.itemLent.push(e.itemName);
      else row.itemBorrowed.push(e.itemName);
    }
  }

  return [...map.values()].map((row) => {
    let primaryDirection: "lend" | "borrow" | "mixed" = "lend";
    if (row.moneySigned > 0 || row.itemLent.length) primaryDirection = "lend";
    if (row.moneySigned < 0 || row.itemBorrowed.length) {
      primaryDirection =
        primaryDirection === "lend" &&
        (row.moneySigned > 0 || row.itemLent.length)
          ? "mixed"
          : "borrow";
    }
    if (row.moneySigned === 0 && !row.itemLent.length && row.itemBorrowed.length) {
      primaryDirection = "borrow";
    }
    return { ...row, primaryDirection };
  });
}

export function insights(state: LedgerState) {
  let lent = 0;
  let borrowed = 0;
  let settled = 0;
  const settleDays: number[] = [];

  for (const e of state.entries) {
    if (e.assetType === "money") {
      if (e.direction === "lend") lent += e.amount;
      else borrowed += e.amount;
    }
    if (e.settled && e.settledAt) {
      settled += 1;
      const start = new Date(e.date).getTime();
      const end = new Date(e.settledAt).getTime();
      settleDays.push(Math.max(0, Math.round((end - start) / 86400000)));
    }
  }

  const avg =
    settleDays.length === 0
      ? 0
      : Math.round(settleDays.reduce((a, b) => a + b, 0) / settleDays.length);

  return { lent, borrowed, settled, avgDays: avg };
}

export function owesYouMost(state: LedgerState): {
  person: Person;
  amount: number;
  ratio: number;
} | null {
  const byPerson = new Map<string, number>();
  let maxTotal = 0;
  for (const e of outstandingEntries(state)) {
    if (e.assetType !== "money" || e.direction !== "lend") continue;
    const rem = remainingBalance(e);
    const next = (byPerson.get(e.personId) ?? 0) + rem;
    byPerson.set(e.personId, next);
    maxTotal = Math.max(maxTotal, next);
  }
  if (maxTotal === 0) return null;
  let topId = "";
  let topAmt = 0;
  for (const [id, amt] of byPerson) {
    if (amt > topAmt) {
      topAmt = amt;
      topId = id;
    }
  }
  const person = getPerson(state, topId);
  if (!person) return null;
  return { person, amount: topAmt, ratio: topAmt / maxTotal };
}

export function ensurePerson(
  people: Person[],
  name: string,
): { people: Person[]; person: Person } {
  const trimmed = name.trim();
  const existing = people.find(
    (p) => p.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (existing) return { people, person: existing };
  const palette = [
    "#E8A0BF",
    "#7BA3D4",
    "#6B9BD1",
    "#9B8EC4",
    "#5DAA8A",
    "#D4A574",
    "#6A8FAF",
    "#C98B9A",
    "#8FBC8F",
    "#CD853F",
  ];
  const person: Person = {
    id: `p-${crypto.randomUUID().slice(0, 8)}`,
    name: trimmed,
    color: palette[people.length % palette.length],
  };
  return { people: [...people, person], person };
}
