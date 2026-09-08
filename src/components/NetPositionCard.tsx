"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { CurrencyCode } from "@/lib/types";

export function NetPositionCard({
  net,
  owedToYou,
  youOwe,
  owedPeople,
  owePeople,
  currency,
}: {
  net: number;
  owedToYou: number;
  youOwe: number;
  owedPeople: number;
  owePeople: number;
  currency: CurrencyCode;
}) {
  const netTone = net > 0 ? "lend" : net < 0 ? "borrow" : "neutral";

  return (
    <section className="card overflow-hidden fade-up">
      <div className="px-5 pb-4 pt-5">
        <p className="section-label">Net position</p>
        <p
          className={`mt-1 text-[42px] font-semibold tracking-tight leading-none tone-${netTone === "neutral" ? "" : netTone}`}
          style={{
            color:
              netTone === "lend"
                ? "var(--accent)"
                : netTone === "borrow"
                  ? "var(--borrow)"
                  : "var(--ink)",
            fontFamily: "var(--font-display)",
          }}
        >
          {formatMoney(net, currency, { signed: true })}
        </p>
      </div>
      <div className="grid grid-cols-2 border-t border-[var(--line)]">
        <div className="border-r border-[var(--line)] px-5 py-4">
          <div className="mb-2 flex items-center gap-2 text-[13px] text-[var(--ink-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            Owed to you
          </div>
          <p className="text-xl font-semibold tone-lend">
            {formatMoney(owedToYou, currency)}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ink-faint)]">
            {owedPeople} {owedPeople === 1 ? "person" : "people"}
          </p>
        </div>
        <div className="px-5 py-4">
          <div className="mb-2 flex items-center gap-2 text-[13px] text-[var(--ink-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--borrow)]" />
            You owe
          </div>
          <p className="text-xl font-semibold tone-borrow">
            {formatMoney(youOwe, currency)}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ink-faint)]">
            {owePeople} {owePeople === 1 ? "person" : "people"}
          </p>
        </div>
      </div>
    </section>
  );
}

export function DirectionToggle({
  value,
  onChange,
}: {
  value: "lend" | "borrow";
  onChange: (v: "lend" | "borrow") => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(
        [
          { id: "lend", label: "I'm Lending", Icon: ArrowUpRight },
          { id: "borrow", label: "I'm Borrowing", Icon: ArrowDownLeft },
        ] as const
      ).map(({ id, label, Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className="flex items-center justify-center gap-2 rounded-[14px] border px-3 py-3.5 text-[14px] font-semibold transition"
            style={{
              borderColor: active ? "var(--accent)" : "var(--line)",
              background: active ? "var(--accent-soft)" : "var(--surface)",
              color: active ? "var(--accent-ink)" : "var(--ink-muted)",
            }}
          >
            <Icon size={18} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function EmptyLedger() {
  return (
    <div className="card px-5 py-10 text-center">
      <p className="text-[15px] font-semibold">Nothing outstanding</p>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">
        Add a lend or borrow to start your ledger.
      </p>
      <Link
        href="/new"
        className="mt-5 inline-flex rounded-[12px] bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"
      >
        New record
      </Link>
    </div>
  );
}
