"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, ArrowDownUp } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Avatar } from "@/components/Avatar";
import { SegmentedControl } from "@/components/SegmentedControl";
import { EmptyLedger, NetPositionCard } from "@/components/NetPositionCard";
import { useActiveLedger } from "@/store/useAppStore";
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
  const [filter, setFilter] = useState<LedgerFilter>("all");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [sort, setSort] = useState<"recent" | "amount">("recent");

  const stats = useMemo(
    () => (ledger ? netPosition(ledger) : null),
    [ledger],
  );

  const rows = useMemo(() => {
    if (!ledger) return [];
    let list = personBalances(ledger);
    if (filter === "lent") {
      list = list.filter(
        (r) =>
          r.moneySigned > 0 ||
          r.itemLent.length > 0 ||
          r.primaryDirection === "lend",
      );
    } else if (filter === "borrowed") {
      list = list.filter(
        (r) =>
          r.moneySigned < 0 ||
          r.itemBorrowed.length > 0 ||
          r.primaryDirection === "borrow",
      );
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((r) => r.person.name.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      if (sort === "amount") {
        return Math.abs(b.moneySigned) - Math.abs(a.moneySigned);
      }
      return b.latestDate.localeCompare(a.latestDate);
    });
    return list;
  }, [ledger, filter, query, sort]);

  if (!ledger || !stats) return null;
  const currency = ledger.preferences.currency;

  return (
    <div className="phone-shell page-pad">
      <header className="mb-5 flex items-start justify-between fade-up">
        <div>
          <p className="section-label">{todayHeader()}</p>
          <h1
            className="mt-1 text-[34px] font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Quittance
          </h1>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="sync-dot" title="Saved" />
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-[12px] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-card)]"
          >
            <Search size={18} />
          </button>
        </div>
      </header>

      {searchOpen && (
        <div className="mb-4 fade-up">
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

      <div className="mt-5 fade-up fade-up-delay-1">
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

      <div className="mt-5 mb-2 flex items-center justify-between fade-up fade-up-delay-2">
        <p className="section-label">Outstanding</p>
        <button
          type="button"
          onClick={() => setSort((s) => (s === "recent" ? "amount" : "recent"))}
          className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-faint)]"
        >
          {sort === "recent" ? "Most recent" : "By amount"}
          <ArrowDownUp size={12} />
        </button>
      </div>

      {rows.length === 0 ? (
        <EmptyLedger />
      ) : (
        <div className="card overflow-hidden fade-up fade-up-delay-3">
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
            const sub = `${dirWord} ${relativeDateLabel(row.latestDate)}${paidBit}`;

            return (
              <Link
                key={row.person.id}
                href={`/person/${row.person.id}`}
                className="card-row"
              >
                <Avatar name={row.person.name} color={row.person.color} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold">
                    {row.person.name}
                  </p>
                  <p className="truncate text-[12px] text-[var(--ink-muted)]">
                    {sub}
                  </p>
                </div>
                <p
                  className={`shrink-0 text-[15px] font-semibold ${
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
        <Plus size={26} strokeWidth={2.4} />
      </Link>
      <BottomNav />
    </div>
  );
}
