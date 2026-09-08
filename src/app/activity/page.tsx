"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Banknote, Package, Check } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Avatar } from "@/components/Avatar";
import { useActiveLedger } from "@/store/useAppStore";
import { getPerson, insights, owesYouMost } from "@/lib/ledger";
import {
  activitySentence,
  formatDayHeader,
  formatMoney,
} from "@/lib/format";

export default function ActivityPage() {
  const ledger = useActiveLedger();
  const stats = useMemo(() => (ledger ? insights(ledger) : null), [ledger]);
  const top = useMemo(() => (ledger ? owesYouMost(ledger) : null), [ledger]);
  const timeline = useMemo(() => {
    if (!ledger) return [];
    const sorted = [...ledger.entries].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
    const groups: { day: string; items: typeof sorted }[] = [];
    for (const e of sorted) {
      const last = groups[groups.length - 1];
      if (!last || last.day !== e.date) groups.push({ day: e.date, items: [e] });
      else last.items.push(e);
    }
    return groups;
  }, [ledger]);

  if (!ledger || !stats) return null;
  const currency = ledger.preferences.currency;

  return (
    <div className="app-shell page-pad">
      <h1 className="mb-4 text-[30px] font-bold tracking-tight">Activity</h1>

      <p className="section-label mb-2">Insights</p>
      <div className="mb-5 grid grid-cols-2 gap-2">
        {[
          { value: formatMoney(stats.lent, currency), label: "Lent all-time" },
          {
            value: formatMoney(stats.borrowed, currency),
            label: "Borrowed all-time",
          },
          { value: String(stats.settled), label: "Settled" },
          {
            value: stats.avgDays ? `${stats.avgDays}d` : "—",
            label: "Avg. to settle",
          },
        ].map((card) => (
          <div key={card.label} className="panel px-3 py-3">
            <p className="amount text-[24px] font-semibold">{card.value}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--ink-faint)]">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {top && (
        <>
          <p className="section-label mb-2">Owes you most</p>
          <div className="panel mb-5 flex items-center gap-3 px-3 py-3">
            <Avatar name={top.person.name} color={top.person.color} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-bold">{top.person.name}</p>
              <div className="mt-2 h-1.5 overflow-hidden bg-[var(--surface-2)]">
                <div
                  className="h-full bg-[var(--accent)]"
                  style={{ width: `${Math.max(12, top.ratio * 100)}%` }}
                />
              </div>
            </div>
            <p className="amount text-[15px] font-semibold tone-lend">
              {formatMoney(top.amount, currency)}
            </p>
          </div>
        </>
      )}

      <p className="section-label mb-2">Timeline</p>
      <div className="space-y-4">
        {timeline.map((group) => (
          <div key={group.day}>
            <p className="section-label mb-2">{formatDayHeader(group.day)}</p>
            <div className="space-y-2">
              {group.items.map((entry) => {
                const person = getPerson(ledger, entry.personId);
                const Icon = entry.settled
                  ? Check
                  : entry.assetType === "item"
                    ? Package
                    : Banknote;
                return (
                  <Link
                    key={entry.id}
                    href={`/entry/${entry.id}`}
                    className="panel flex items-center gap-3 px-3 py-3"
                  >
                    <div
                      className="grid h-9 w-9 shrink-0 place-items-center"
                      style={{
                        borderRadius: "var(--radius)",
                        background: entry.settled
                          ? "var(--surface-2)"
                          : entry.direction === "lend"
                            ? "var(--accent-soft)"
                            : "var(--borrow-soft)",
                        color: entry.settled
                          ? "var(--ink-faint)"
                          : entry.direction === "lend"
                            ? "var(--accent)"
                            : "var(--borrow)",
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <p className="min-w-0 flex-1 text-[14px] leading-snug">
                      {activitySentence(entry, person, currency)}
                    </p>
                    <ChevronRight
                      size={16}
                      className="shrink-0 text-[var(--ink-faint)]"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        {timeline.length === 0 && (
          <div className="panel px-4 py-8 text-center text-sm text-[var(--ink-muted)]">
            No activity yet.
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
