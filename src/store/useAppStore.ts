"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Account,
  AccentId,
  CurrencyCode,
  Entry,
  LedgerState,
  ListDensity,
  Preferences,
  ThemeMode,
} from "@/lib/types";
import { DEFAULT_PREFERENCES } from "@/lib/types";
import { createEmptyLedger, createSeedLedger } from "@/lib/seed";
import { ensurePerson } from "@/lib/ledger";
import { hashPassword, randomSalt } from "@/lib/crypto";

interface Session {
  accountId: string;
  username: string;
}

interface AppStore {
  hydrated: boolean;
  accounts: Account[];
  ledgers: Record<string, LedgerState>;
  session: Session | null;
  savePulse: number;
  setHydrated: (v: boolean) => void;
  signUp: (username: string, password: string, demo?: boolean) => Promise<string | null>;
  signIn: (username: string, password: string) => Promise<string | null>;
  signOut: () => void;
  tryDemo: () => Promise<void>;
  updatePreferences: ( partial: Partial<Preferences>) => void;
  addEntry: (input: Omit<Entry, "id" | "createdAt" | "personId" | "settled" | "paid"> & {
    personName: string;
    paid?: number;
  }) => void;
  settleEntry: (entryId: string) => void;
  deleteEntry: (entryId: string) => void;
  importLedger: (data: LedgerState) => void;
  replaceLedger: (data: LedgerState) => void;
  bumpSave: () => void;
}

function emptyPrefs(): Preferences {
  return { ...DEFAULT_PREFERENCES };
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      accounts: [],
      ledgers: {},
      session: null,
      savePulse: 0,

      setHydrated: (v) => set({ hydrated: v }),

      bumpSave: () => set({ savePulse: Date.now() }),

      signUp: async (username, password, demo = false) => {
        const name = username.trim().toLowerCase();
        if (!name || password.length < 4) {
          return "Choose a username and a password (4+ characters).";
        }
        if (get().accounts.some((a) => a.username === name)) {
          return "That username is taken.";
        }
        const salt = randomSalt();
        const passwordHash = `${salt}.${await hashPassword(password, salt)}`;
        const account: Account = {
          id: `a-${crypto.randomUUID().slice(0, 8)}`,
          username: name,
          passwordHash,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          accounts: [...s.accounts, account],
          ledgers: {
            ...s.ledgers,
            [account.id]: demo ? createSeedLedger() : createEmptyLedger(),
          },
          session: { accountId: account.id, username: name },
          savePulse: Date.now(),
        }));
        return null;
      },

      signIn: async (username, password) => {
        const name = username.trim().toLowerCase();
        const account = get().accounts.find((a) => a.username === name);
        if (!account) return "No account with that username.";
        const [salt, hash] = account.passwordHash.split(".");
        const attempt = await hashPassword(password, salt);
        if (attempt !== hash) return "Wrong password.";
        set({
          session: { accountId: account.id, username: name },
          savePulse: Date.now(),
        });
        return null;
      },

      signOut: () => set({ session: null }),

      tryDemo: async () => {
        const existing = get().accounts.find((a) => a.username === "demo");
        if (existing) {
          set({
            session: { accountId: existing.id, username: "demo" },
            ledgers: {
              ...get().ledgers,
              [existing.id]: createSeedLedger(),
            },
            savePulse: Date.now(),
          });
          return;
        }
        await get().signUp("demo", "demo1234", true);
      },

      updatePreferences: (partial) => {
        const { session, ledgers } = get();
        if (!session) return;
        const ledger = ledgers[session.accountId];
        if (!ledger) return;
        set({
          ledgers: {
            ...ledgers,
            [session.accountId]: {
              ...ledger,
              preferences: { ...ledger.preferences, ...partial },
            },
          },
          savePulse: Date.now(),
        });
      },

      addEntry: (input) => {
        const { session, ledgers } = get();
        if (!session) return;
        const ledger = ledgers[session.accountId];
        if (!ledger) return;
        const { people, person } = ensurePerson(ledger.people, input.personName);
        const entry: Entry = {
          id: `e-${crypto.randomUUID().slice(0, 8)}`,
          personId: person.id,
          direction: input.direction,
          assetType: input.assetType,
          amount: input.amount,
          paid: input.paid ?? 0,
          itemName: input.itemName,
          category: input.category,
          photoDataUrl: input.photoDataUrl,
          note: input.note,
          date: input.date,
          expectedBack: input.expectedBack,
          reminder: input.reminder,
          reminderDate: input.reminderDate,
          settled: false,
          createdAt: new Date().toISOString(),
        };
        set({
          ledgers: {
            ...ledgers,
            [session.accountId]: {
              ...ledger,
              people,
              entries: [entry, ...ledger.entries],
            },
          },
          savePulse: Date.now(),
        });
      },

      settleEntry: (entryId) => {
        const { session, ledgers } = get();
        if (!session) return;
        const ledger = ledgers[session.accountId];
        if (!ledger) return;
        set({
          ledgers: {
            ...ledgers,
            [session.accountId]: {
              ...ledger,
              entries: ledger.entries.map((e) =>
                e.id === entryId
                  ? {
                      ...e,
                      settled: true,
                      paid: e.assetType === "money" ? e.amount : e.paid,
                      settledAt: new Date().toISOString().slice(0, 10),
                    }
                  : e,
              ),
            },
          },
          savePulse: Date.now(),
        });
      },

      deleteEntry: (entryId) => {
        const { session, ledgers } = get();
        if (!session) return;
        const ledger = ledgers[session.accountId];
        if (!ledger) return;
        set({
          ledgers: {
            ...ledgers,
            [session.accountId]: {
              ...ledger,
              entries: ledger.entries.filter((e) => e.id !== entryId),
            },
          },
          savePulse: Date.now(),
        });
      },

      importLedger: (data) => {
        const { session, ledgers } = get();
        if (!session) return;
        set({
          ledgers: {
            ...ledgers,
            [session.accountId]: {
              people: data.people ?? [],
              entries: data.entries ?? [],
              preferences: {
                ...emptyPrefs(),
                ...(data.preferences ?? {}),
              },
            },
          },
          savePulse: Date.now(),
        });
      },

      replaceLedger: (data) => get().importLedger(data),
    }),
    {
      name: "quittance-v1",
      partialize: (s) => ({
        accounts: s.accounts,
        ledgers: s.ledgers,
        session: s.session,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function useActiveLedger(): LedgerState | null {
  const session = useAppStore((s) => s.session);
  const ledgers = useAppStore((s) => s.ledgers);
  if (!session) return null;
  return ledgers[session.accountId] ?? null;
}

export function usePrefs(): Preferences {
  const ledger = useActiveLedger();
  return ledger?.preferences ?? DEFAULT_PREFERENCES;
}

export type PrefHelpers = {
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: AccentId) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setDensity: (density: ListDensity) => void;
};
