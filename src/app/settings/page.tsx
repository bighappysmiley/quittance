"use client";

import { useMemo, useRef } from "react";
import {
  Cloud,
  LogOut,
  Download,
  FileSpreadsheet,
  Upload,
  Shield,
  Info,
  User,
  Check,
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

export default function SettingsPage() {
  const ledger = useActiveLedger();
  const prefs = usePrefs();
  const session = useAppStore((s) => s.session);
  const savePulse = useAppStore((s) => s.savePulse);
  const updatePreferences = useAppStore((s) => s.updatePreferences);
  const signOut = useAppStore((s) => s.signOut);
  const importLedger = useAppStore((s) => s.importLedger);
  const fileRef = useRef<HTMLInputElement>(null);

  const counts = useMemo(() => {
    if (!ledger) return { people: 0, entries: 0 };
    return {
      people: ledger.people.length,
      entries: ledger.entries.length,
    };
  }, [ledger]);

  if (!ledger || !session) return null;

  function exportJson() {
    if (!ledger) return;
    const blob = new Blob([JSON.stringify(ledger, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, `quittance-${session!.username}.json`);
  }

  function exportCsv() {
    if (!ledger) return;
    const peopleMap = Object.fromEntries(
      ledger.people.map((p) => [p.id, p.name]),
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
    const rows = ledger.entries.map((e) =>
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
    const blob = new Blob([[header.join(","), ...rows].join("\n")], {
      type: "text/csv",
    });
    downloadBlob(blob, `quittance-${session!.username}.csv`);
  }

  async function onImportFile(file: File) {
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      importLedger(data);
    } catch {
      alert("Could not read that JSON file.");
    }
  }

  return (
    <div className="phone-shell page-pad">
      <h1
        className="mb-5 text-[34px] font-semibold tracking-tight fade-up"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Settings
      </h1>

      <p className="section-label mb-2 fade-up">Account</p>
      <div className="card mb-2 overflow-hidden fade-up fade-up-delay-1">
        <div className="card-row">
          <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[var(--surface-2)] text-[var(--ink-muted)]">
            <User size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold">{session.username}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[var(--ink-muted)]">
              <Cloud size={12} />
              All changes saved
              <span className="sr-only">{savePulse}</span>
            </p>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={signOut}
        className="card card-row mb-6 fade-up fade-up-delay-1"
      >
        <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[var(--borrow-soft)] text-[var(--borrow)]">
          <LogOut size={18} />
        </div>
        <span className="text-[15px] font-semibold text-[var(--borrow)]">
          Log out
        </span>
      </button>

      <p className="section-label mb-2">Appearance</p>
      <div className="card mb-6 space-y-5 p-4 fade-up fade-up-delay-2">
        <div>
          <p className="mb-2 text-[14px] font-semibold">Theme</p>
          <SegmentedControl
            ariaLabel="Theme"
            value={prefs.theme}
            onChange={(theme: ThemeMode) => updatePreferences({ theme })}
            options={[
              { value: "auto", label: "Auto" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </div>

        <div>
          <p className="mb-2 text-[14px] font-semibold">Accent color</p>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(ACCENTS) as AccentId[]).map((id) => (
              <button
                key={id}
                type="button"
                aria-label={ACCENTS[id].label}
                onClick={() => updatePreferences({ accent: id })}
                className="grid h-9 w-9 place-items-center rounded-full"
                style={{ background: ACCENTS[id].value }}
              >
                {prefs.accent === id && (
                  <Check size={16} color="white" strokeWidth={3} />
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[14px] font-semibold">Currency</p>
          <div className="grid grid-cols-4 gap-2">
            {CURRENCIES.map((c) => {
              const active = prefs.currency === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() =>
                    updatePreferences({ currency: c.code as CurrencyCode })
                  }
                  className="rounded-[12px] border px-1 py-2.5 text-[12px] font-semibold"
                  style={{
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
          <p className="mb-2 text-[14px] font-semibold">List density</p>
          <SegmentedControl
            ariaLabel="List density"
            value={prefs.density}
            onChange={(density: ListDensity) => updatePreferences({ density })}
            options={[
              { value: "compact", label: "Compact" },
              { value: "comfortable", label: "Comfortable" },
              { value: "spacious", label: "Spacious" },
            ]}
          />
        </div>
      </div>

      <div className="card mb-2 overflow-hidden fade-up fade-up-delay-2">
        <div className="card-row !cursor-default">
          <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[var(--surface-2)] text-[var(--ink-muted)]">
            <Shield size={18} />
          </div>
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-[14px] font-semibold leading-snug">
              Confirm before deleting or settling
            </p>
            <p className="mt-0.5 text-[12px] text-[var(--ink-muted)]">
              Asks before you delete an entry or mark it returned/paid.
            </p>
          </div>
          <button
            type="button"
            className="toggle"
            data-on={prefs.confirmActions}
            aria-pressed={prefs.confirmActions}
            onClick={() =>
              updatePreferences({ confirmActions: !prefs.confirmActions })
            }
          >
            <span />
          </button>
        </div>
      </div>
      <p className="mb-6 px-1 text-[12px] text-[var(--ink-faint)]">
        Turn this off to settle and delete entries in a single tap.
      </p>

      <p className="section-label mb-2">Data</p>
      <div className="card mb-2 overflow-hidden fade-up fade-up-delay-3">
        <button type="button" className="card-row" onClick={exportJson}>
          <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[var(--surface-2)] text-[var(--ink-muted)]">
            <Download size={18} />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[14px] font-semibold">Copy all data (JSON)</p>
            <p className="text-[12px] text-[var(--ink-muted)]">
              {counts.people} people · {counts.entries} entries
            </p>
          </div>
        </button>
        <button type="button" className="card-row" onClick={exportCsv}>
          <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[var(--surface-2)] text-[var(--ink-muted)]">
            <FileSpreadsheet size={18} />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[14px] font-semibold">Export as CSV</p>
            <p className="text-[12px] text-[var(--ink-muted)]">
              Opens in Numbers, Excel, or Sheets.
            </p>
          </div>
        </button>
        <button
          type="button"
          className="card-row"
          onClick={() => fileRef.current?.click()}
        >
          <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[var(--surface-2)] text-[var(--ink-muted)]">
            <Upload size={18} />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[14px] font-semibold">Import data (JSON)</p>
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
      <p className="mb-6 px-1 text-[12px] text-[var(--ink-faint)]">
        Your ledger saves automatically to this account. Exporting gives you a
        copy you control.
      </p>

      <p className="section-label mb-2">About</p>
      <div className="card card-row !cursor-default fade-up fade-up-delay-3">
        <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[var(--surface-2)] text-[var(--ink-muted)]">
          <Info size={18} />
        </div>
        <p className="text-[13px] leading-relaxed text-[var(--ink-muted)]">
          <span className="font-semibold text-[var(--ink)]">Quittance</span> — A
          private way to track who owes what — synced to your account, seen only
          by you.
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
