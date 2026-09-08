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
    <section className="panel overflow-hidden border-0 shadow-[var(--shadow-soft)]">
      <div
        className="relative px-5 pb-4 pt-5 text-white"
        style={{
          background:
            "linear-gradient(165deg, #1f3d32 0%, #182029 48%, #2c211c 100%)",
        }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
          Net position
        </p>
        <p
          className="amount mt-2 text-[40px] font-semibold leading-none tracking-tight"
          style={{
            color:
              netTone === "lend"
                ? "#8fd6b0"
                : netTone === "borrow"
                  ? "#e8c4b4"
                  : "rgba(255,255,255,0.88)",
            fontFamily: "var(--font-display)",
          }}
        >
          {formatMoney(net, currency, { signed: true })}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
          <div>
            <p className="text-[12px] text-white/45">Owed to you</p>
            <p className="amount mt-0.5 text-lg font-semibold text-[#8fd6b0]">
              {formatMoney(owedToYou, currency)}
            </p>
            <p className="text-[11px] text-white/35">
              {owedPeople} {owedPeople === 1 ? "person" : "people"}
            </p>
          </div>
          <div>
            <p className="text-[12px] text-white/45">You owe</p>
            <p className="amount mt-0.5 text-lg font-semibold text-[#e8c4b4]">
              {formatMoney(youOwe, currency)}
            </p>
            <p className="text-[11px] text-white/35">
              {owePeople} {owePeople === 1 ? "person" : "people"}
            </p>
          </div>
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
