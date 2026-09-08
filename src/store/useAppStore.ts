"use client";

import { create } from "zustand";
import type {
  AccentId,
  CurrencyCode,
  Entry,
  LedgerState,
  ListDensity,
  Preferences,
  ThemeMode,
} from "@/lib/types";
import { DEFAULT_PREFERENCES } from "@/lib/types";

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

interface AppStore {
  hydrated: boolean;
  loading: boolean;
  user: UserInfo | null;
  ledger: LedgerState | null;
  setHydrated: (v: boolean) => void;
  refresh: () => Promise<"ok" | "unauthorized" | "error">;
  signOutLocal: () => void;
  updatePreferences: (partial: Partial<Preferences>) => Promise<void>;
  addEntry: (input: {
    personName: string;
    direction: Entry["direction"];
    assetType: Entry["assetType"];
    amount: number;
    itemName?: string;
    category?: string;
    date: string;
    expectedBack?: string;
    reminder?: string;
  }) => Promise<void>;
  settleEntry: (entryId: string) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
  loadDemo: () => Promise<void>;
  importLedger: (data: LedgerState) => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  hydrated: false,
  loading: false,
  user: null,
  ledger: null,

  setHydrated: (v) => set({ hydrated: v }),

  signOutLocal: () => set({ user: null, ledger: null }),

  refresh: async () => {
    set({ loading: true });

    const attempt = async () => {
      const res = await fetch("/api/ledger", {
        cache: "no-store",
        credentials: "include",
        signal: AbortSignal.timeout(20000),
      });
      return res;
    };

    try {
      let res = await attempt();
      // Neon compute can be cold on reopen — retry once.
      if (!res.ok && res.status !== 401) {
        await new Promise((r) => setTimeout(r, 1200));
        res = await attempt();
      }

      if (res.status === 401) {
        set({ user: null, ledger: null, hydrated: true, loading: false });
        return "unauthorized";
      }
      if (!res.ok) throw new Error("Failed to load ledger");
      const data = await res.json();
      set({
        user: data.user,
        ledger: data.ledger,
        hydrated: true,
        loading: false,
      });
      return "ok";
    } catch {
      // Network / timeout on reopen — don't pretend the user signed out.
      set({ hydrated: true, loading: false });
      return "error";
    }
  },

  updatePreferences: async (partial) => {
    const ledger = get().ledger;
    if (!ledger) return;
    const next = { ...ledger.preferences, ...partial };
    set({ ledger: { ...ledger, preferences: next } });
    await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
  },

  addEntry: async (input) => {
    await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    await get().refresh();
  },

  settleEntry: async (entryId) => {
    await fetch("/api/entries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "settle", entryId }),
    });
    await get().refresh();
  },

  deleteEntry: async (entryId) => {
    await fetch(`/api/entries?entryId=${encodeURIComponent(entryId)}`, {
      method: "DELETE",
    });
    await get().refresh();
  },

  loadDemo: async () => {
    const res = await fetch("/api/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "demo" }),
    });
    if (!res.ok) throw new Error("Demo load failed");
    const data = await res.json();
    set((s) => ({ ledger: data.ledger, user: s.user }));
  },

  importLedger: async (ledgerData) => {
    const res = await fetch("/api/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "import", ledger: ledgerData }),
    });
    if (!res.ok) throw new Error("Import failed");
    const data = await res.json();
    set((s) => ({ ledger: data.ledger, user: s.user }));
  },
}));

export function useActiveLedger(): LedgerState | null {
  return useAppStore((s) => s.ledger);
}

export function usePrefs(): Preferences {
  const ledger = useActiveLedger();
  return ledger?.preferences ?? DEFAULT_PREFERENCES;
}

export type PrefPatch = {
  theme?: ThemeMode;
  accent?: AccentId;
  currency?: CurrencyCode;
  density?: ListDensity;
};
