"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, ArrowDownUp } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Avatar } from "@/components/Avatar";
import { SegmentedControl } from "@/components/SegmentedControl";
import { EmptyLedger, NetPositionCard } from "@/components/NetPositionCard";
import { useActiveLedger, useAppStore } from "@/store/useAppStore";
import { netPosition, personBalances } from "@/lib/ledger";
import {
  entryDisplayAmount,
  formatMoney,
  relativeDateLabel,
  todayHeader,
} from "@/lib/format";
import type { LedgerFilter } from "@/lib/types";

export default function LedgerPage() {
  const ledger = useActiveLedger();
  const loadDemo = useAppStore((s) => s.loadDemo);
  const [filter, setFilter] = useState<LedgerFilter>("all");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [sort, setSort] = useState<"recent" | "amount">("recent");
  const [demoBusy, setDemoBusy] = useState(false);

  const stats = useMemo(
    () => (ledger ? netPosition(ledger) : null),
    [ledger],
  );

  const rows = useMemo(() => {
    if (!ledger) return [];
    let list = personBalances(ledger);
    if (filter === "lent") {
      list = list.filter(
        (r) => r.moneySigned > 0 || r.itemLent.length > 0,
      );
    } else if (filter === "borrowed") {
      list = list.filter(
        (r) => r.moneySigned < 0 || r.itemBorrowed.length > 0,
      );
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((r) => r.person.name.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) =>
      sort === "amount"
        ? Math.abs(b.moneySigned) - Math.abs(a.moneySigned)
        : b.latestDate.localeCompare(a.latestDate),
    );
  }, [ledger, filter, query, sort]);

  if (!ledger || !stats) return null;
  const currency = ledger.preferences.currency;

  return (
    <div className="app-shell page-pad">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <p className="section-label">{todayHeader()}</p>
          <h1 className="mt-1 text-[30px] font-bold tracking-tight">Quittance</h1>
        </div>
        <button
          type="button"
          aria-label="Search"
          onClick={() => setSearchOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center border border-[var(--line)] bg-[var(--surface)]"
          style={{ borderRadius: "var(--radius)" }}
        >
          <Search size={16} />
        </button>
      </header>

      {searchOpen && (
        <div className="mb-3">
          <input
            autoFocus
            className="input-field"
            placeholder="Search people…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      <NetPositionCard {...stats} currency={currency} />

      <div className="mt-4">
        <SegmentedControl
          ariaLabel="Filter ledger"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "lent", label: "Lent" },
            { value: "borrowed", label: "Borrowed" },
          ]}
        />
      </div>

      <div className="mt-4 mb-2 flex items-center justify-between">
        <p className="section-label">Outstanding</p>
        <button
          type="button"
          onClick={() => setSort((s) => (s === "recent" ? "amount" : "recent"))}
          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--ink-faint)]"
        >
          {sort === "recent" ? "Most recent" : "By amount"}
          <ArrowDownUp size={12} />
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="space-y-3">
          <EmptyLedger />
          <button
            type="button"
            className="btn-secondary w-full"
            disabled={demoBusy}
            onClick={async () => {
              setDemoBusy(true);
              try {
                await loadDemo();
              } finally {
                setDemoBusy(false);
              }
            }}
          >
            {demoBusy ? "Loading sample…" : "Load fictional sample ledger"}
          </button>
          <p className="px-1 text-[12px] text-[var(--ink-faint)]">
            Sample uses made-up names (Alex, Jordan, Riley, Morgan) — not anyone
            real.
          </p>
        </div>
      ) : (
        <div className="panel overflow-hidden">
          {rows.map((row) => {
            const moneyEntry = row.entries.find((e) => e.assetType === "money");
            const itemEntry = row.entries.find((e) => e.assetType === "item");
            const display = moneyEntry
              ? entryDisplayAmount(moneyEntry, currency)
              : itemEntry
                ? entryDisplayAmount(itemEntry, currency)
                : { text: "—", tone: "neutral" as const };
            const dirWord =
              row.moneySigned < 0 || row.itemBorrowed.length
                ? "Borrowed"
                : "Lent";
            const paidBit =
              row.paidTotal > 0
                ? ` · ${formatMoney(row.paidTotal, currency)} paid`
                : "";

            return (
              <Link
                key={row.person.id}
                href={`/person/${row.person.id}`}
                className="row"
              >
                <Avatar name={row.person.name} color={row.person.color} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold">
                    {row.person.name}
                  </p>
                  <p className="truncate text-[12px] text-[var(--ink-muted)]">
                    {dirWord} {relativeDateLabel(row.latestDate)}
                    {paidBit}
                  </p>
                </div>
                <p
                  className={`amount shrink-0 text-[15px] font-semibold ${
                    display.tone === "lend"
                      ? "tone-lend"
                      : display.tone === "borrow"
                        ? "tone-borrow"
                        : ""
                  }`}
                >
                  {display.text}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      <Link href="/new" className="fab" aria-label="New record">
        <Plus size={24} strokeWidth={2.4} />
      </Link>
      <BottomNav />
    </div>
  );
}
