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
    <section className="panel overflow-hidden">
      <div className="px-4 pb-3 pt-4">
        <p className="section-label">Net position</p>
        <p
          className={`amount mt-1 text-[40px] font-semibold leading-none ${
            netTone === "lend"
              ? "tone-lend"
              : netTone === "borrow"
                ? "tone-borrow"
                : ""
          }`}
        >
          {formatMoney(net, currency, { signed: true })}
        </p>
      </div>
      <div className="grid grid-cols-2 border-t border-[var(--line)]">
        <div className="border-r border-[var(--line)] px-4 py-3">
          <p className="text-[12px] text-[var(--ink-muted)]">Owed to you</p>
          <p className="amount mt-1 text-lg font-semibold tone-lend">
            {formatMoney(owedToYou, currency)}
          </p>
          <p className="text-[11px] text-[var(--ink-faint)]">
            {owedPeople} {owedPeople === 1 ? "person" : "people"}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[12px] text-[var(--ink-muted)]">You owe</p>
          <p className="amount mt-1 text-lg font-semibold tone-borrow">
            {formatMoney(youOwe, currency)}
          </p>
          <p className="text-[11px] text-[var(--ink-faint)]">
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
          { id: "lend", label: "I'm lending", Icon: ArrowUpRight },
          { id: "borrow", label: "I'm borrowing", Icon: ArrowDownLeft },
        ] as const
      ).map(({ id, label, Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className="flex items-center justify-center gap-2 border px-3 py-3 text-[13px] font-bold"
            style={{
              borderRadius: "var(--radius)",
              borderColor: active ? "var(--accent)" : "var(--line)",
              background: active ? "var(--accent-soft)" : "var(--surface)",
              color: active ? "var(--accent-ink)" : "var(--ink-muted)",
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function EmptyLedger() {
  return (
    <div className="panel px-4 py-8 text-center">
      <p className="text-[15px] font-bold">Nothing outstanding</p>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">
        Add your first lend or borrow to get started.
      </p>
      <Link href="/new" className="btn-primary mt-4 inline-flex">
        New record
      </Link>
    </div>
  );
}
