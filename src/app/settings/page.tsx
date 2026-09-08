"use client";

import { useMemo, useRef, useState } from "react";
import {
  LogOut,
  Download,
  FileSpreadsheet,
  Upload,
  Shield,
  Info,
  User,
  Check,
  Beaker,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { SegmentedControl } from "@/components/SegmentedControl";
import {
  useActiveLedger,
  useAppStore,
  usePrefs,
} from "@/store/useAppStore";
import {
  ACCENTS,
  CURRENCIES,
  type AccentId,
  type CurrencyCode,
  type ListDensity,
  type ThemeMode,
} from "@/lib/types";
import { abortTimeout } from "@/lib/safe";

export default function SettingsPage() {
  const ledger = useActiveLedger();
  const prefs = usePrefs();
  const user = useAppStore((s) => s.user);
  const updatePreferences = useAppStore((s) => s.updatePreferences);
  const signOutLocal = useAppStore((s) => s.signOutLocal);
  const loadDemo = useAppStore((s) => s.loadDemo);
  const importLedger = useAppStore((s) => s.importLedger);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const counts = useMemo(() => {
    if (!ledger) return { people: 0, entries: 0 };
    return { people: ledger.people.length, entries: ledger.entries.length };
  }, [ledger]);

  if (!ledger || !user) return null;

  function exportJson() {
    const blob = new Blob([JSON.stringify(ledger, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, `quittance-${user!.email}.json`);
  }

  function exportCsv() {
    const peopleMap = Object.fromEntries(
      ledger!.people.map((p) => [p.id, p.name]),
    );
    const header = [
      "id",
      "person",
      "direction",
      "assetType",
      "amount",
      "paid",
      "itemName",
      "date",
      "settled",
    ];
    const rows = ledger!.entries.map((e) =>
      [
        e.id,
        peopleMap[e.personId] ?? "",
        e.direction,
        e.assetType,
        e.amount,
        e.paid,
        e.itemName ?? "",
        e.date,
        e.settled,
      ]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(","),
    );
    downloadBlob(
      new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv" }),
      `quittance-${user!.email}.csv`,
    );
  }

  async function onImportFile(file: File) {
    try {
      const data = JSON.parse(await file.text());
      await importLedger(data);
    } catch {
      alert("That backup file couldn’t be read.");
    }
  }

  async function onSignOut() {
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
        signal: abortTimeout(10000),
      });
    } catch {
      // still clear local state
    }
    signOutLocal();
    window.location.href = "/auth/sign-in";
  }

  return (
    <div className="app-shell page-pad">
      <h1 className="brand-mark mb-4 text-[34px] tracking-tight">Settings</h1>

      <p className="section-label mb-2">Account</p>
      <div className="panel mb-2 overflow-hidden">
        <div className="row !cursor-default">
          <div className="grid h-9 w-9 place-items-center bg-[var(--surface-2)] text-[var(--ink-muted)]" style={{ borderRadius: "var(--radius)" }}>
            <User size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold">{user.name || user.email}</p>
            <p className="text-[12px] text-[var(--ink-muted)]">{user.email}</p>
            <p className="mt-0.5 text-[11px] text-[var(--ink-faint)]">
              All changes saved
            </p>
          </div>
        </div>
      </div>
      <button type="button" onClick={onSignOut} className="panel row mb-5">
        <div className="grid h-9 w-9 place-items-center bg-[var(--borrow-soft)] text-[var(--borrow)]" style={{ borderRadius: "var(--radius)" }}>
          <LogOut size={16} />
        </div>
        <span className="text-[15px] font-bold text-[var(--borrow)]">Log out</span>
      </button>

      <p className="section-label mb-2">Appearance</p>
      <div className="panel mb-5 space-y-4 p-4">
        <div>
          <p className="mb-2 text-[14px] font-bold">Theme</p>
          <SegmentedControl
            ariaLabel="Theme"
            value={prefs.theme}
            onChange={(theme: ThemeMode) => void updatePreferences({ theme })}
            options={[
              { value: "auto", label: "Auto" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </div>
        <div>
          <p className="mb-2 text-[14px] font-bold">Accent</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ACCENTS) as AccentId[]).map((id) => (
              <button
                key={id}
                type="button"
                aria-label={ACCENTS[id].label}
                onClick={() => void updatePreferences({ accent: id })}
                className="grid h-8 w-8 place-items-center"
                style={{
                  background: ACCENTS[id].value,
                  borderRadius: "var(--radius)",
                }}
              >
                {prefs.accent === id && (
                  <Check size={14} color="#0e1110" strokeWidth={3} />
                )}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[14px] font-bold">Currency</p>
          <div className="grid grid-cols-4 gap-2">
            {CURRENCIES.map((c) => {
              const active = prefs.currency === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() =>
                    void updatePreferences({ currency: c.code as CurrencyCode })
                  }
                  className="border px-1 py-2 text-[11px] font-bold"
                  style={{
                    borderRadius: "var(--radius)",
                    borderColor: active ? "var(--accent)" : "var(--line)",
                    background: active ? "var(--accent-soft)" : "var(--surface)",
                    color: active ? "var(--accent-ink)" : "var(--ink-muted)",
                  }}
                >
                  {c.symbol} {c.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[14px] font-bold">List density</p>
          <SegmentedControl
            ariaLabel="List density"
            value={prefs.density}
            onChange={(density: ListDensity) =>
              void updatePreferences({ density })
            }
            options={[
              { value: "compact", label: "Compact" },
              { value: "comfortable", label: "Comfortable" },
              { value: "spacious", label: "Spacious" },
            ]}
          />
        </div>
      </div>

      <div className="panel mb-2 overflow-hidden">
        <div className="row !cursor-default">
          <div className="grid h-9 w-9 place-items-center bg-[var(--surface-2)] text-[var(--ink-muted)]" style={{ borderRadius: "var(--radius)" }}>
            <Shield size={16} />
          </div>
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-[14px] font-bold leading-snug">
              Confirm before deleting or settling
            </p>
          </div>
          <button
            type="button"
            className="toggle"
            data-on={prefs.confirmActions}
            aria-pressed={prefs.confirmActions}
            onClick={() =>
              void updatePreferences({ confirmActions: !prefs.confirmActions })
            }
          >
            <span />
          </button>
        </div>
      </div>
      <p className="mb-5 px-1 text-[12px] text-[var(--ink-faint)]">
        Turn off for one-tap settle/delete.
      </p>

      <p className="section-label mb-2">Data</p>
      <div className="panel mb-2 overflow-hidden">
        <button
          type="button"
          className="row"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await loadDemo();
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="grid h-9 w-9 place-items-center bg-[var(--surface-2)] text-[var(--ink-muted)]" style={{ borderRadius: "var(--radius)" }}>
            <Beaker size={16} />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[14px] font-bold">Try a sample ledger</p>
            <p className="text-[12px] text-[var(--ink-muted)]">
              Preview with made-up people — replace anytime
            </p>
          </div>
        </button>
        <button type="button" className="row" onClick={exportJson}>
          <div className="grid h-9 w-9 place-items-center bg-[var(--surface-2)] text-[var(--ink-muted)]" style={{ borderRadius: "var(--radius)" }}>
            <Download size={16} />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[14px] font-bold">Download a backup</p>
            <p className="text-[12px] text-[var(--ink-muted)]">
              {counts.people} people · {counts.entries} entries
            </p>
          </div>
        </button>
        <button type="button" className="row" onClick={exportCsv}>
          <div className="grid h-9 w-9 place-items-center bg-[var(--surface-2)] text-[var(--ink-muted)]" style={{ borderRadius: "var(--radius)" }}>
            <FileSpreadsheet size={16} />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[14px] font-bold">Export spreadsheet</p>
            <p className="text-[12px] text-[var(--ink-muted)]">
              Opens in Numbers, Excel, or Sheets
            </p>
          </div>
        </button>
        <button
          type="button"
          className="row"
          onClick={() => fileRef.current?.click()}
        >
          <div className="grid h-9 w-9 place-items-center bg-[var(--surface-2)] text-[var(--ink-muted)]" style={{ borderRadius: "var(--radius)" }}>
            <Upload size={16} />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[14px] font-bold">Restore from backup</p>
            <p className="text-[12px] text-[var(--ink-muted)]">
              Replace this ledger with a saved copy
            </p>
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onImportFile(f);
            e.target.value = "";
          }}
        />
      </div>
      <p className="mb-5 px-1 text-[12px] text-[var(--ink-faint)]">
        Your ledger syncs automatically to your account. Backups give you a copy
        you control.
      </p>

      <p className="section-label mb-2">About</p>
      <div className="panel row !cursor-default">
        <div className="grid h-9 w-9 place-items-center bg-[var(--surface-2)] text-[var(--ink-muted)]" style={{ borderRadius: "var(--radius)" }}>
          <Info size={16} />
        </div>
        <p className="text-[13px] leading-relaxed text-[var(--ink-muted)]">
          <span className="font-bold text-[var(--ink)]">Quittance</span> —
          private way to track who owes what — synced across your devices, seen
          only by you.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
