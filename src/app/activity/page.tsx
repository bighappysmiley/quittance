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
    <div className="phone-shell page-pad">
      <h1
        className="mb-5 text-[34px] font-semibold tracking-tight fade-up"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Activity
      </h1>

      <p className="section-label mb-2 fade-up">Insights</p>
      <div className="mb-6 grid grid-cols-2 gap-2.5 fade-up fade-up-delay-1">
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
          <div key={card.label} className="card px-4 py-4">
            <p
              className="text-[26px] font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {card.value}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-faint)]">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {top && (
        <>
          <p className="section-label mb-2 fade-up fade-up-delay-1">
            Owes you most
          </p>
          <div className="card mb-6 flex items-center gap-3 px-4 py-3.5 fade-up fade-up-delay-2">
            <Avatar name={top.person.name} color={top.person.color} size={42} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold">
                {top.person.name}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)]"
                  style={{ width: `${Math.max(12, top.ratio * 100)}%` }}
                />
              </div>
            </div>
            <p className="text-[15px] font-semibold tone-lend">
              {formatMoney(top.amount, currency)}
            </p>
          </div>
        </>
      )}

      <p className="section-label mb-2 fade-up fade-up-delay-2">Timeline</p>
      <div className="space-y-4 fade-up fade-up-delay-3">
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
                const iconBg = entry.settled
                  ? "var(--surface-2)"
                  : entry.direction === "lend"
                    ? "var(--accent-soft)"
                    : "var(--borrow-soft)";
                const iconColor = entry.settled
                  ? "var(--ink-faint)"
                  : entry.direction === "lend"
                    ? "var(--accent)"
                    : "var(--borrow)";

                return (
                  <Link
                    key={entry.id}
                    href={`/entry/${entry.id}`}
                    className="card flex items-center gap-3 px-3.5 py-3"
                  >
                    <div
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px]"
                      style={{ background: iconBg, color: iconColor }}
                    >
                      <Icon size={18} />
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
          <div className="card px-5 py-8 text-center text-sm text-[var(--ink-muted)]">
            No activity yet.
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
