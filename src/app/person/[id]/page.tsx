"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { useActiveLedger, useAppStore, usePrefs } from "@/store/useAppStore";
import { getPerson } from "@/lib/ledger";
import {
  entryDisplayAmount,
  formatLongDate,
  formatMoney,
} from "@/lib/format";

export default function PersonPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const ledger = useActiveLedger();
  const prefs = usePrefs();
  const settleEntry = useAppStore((s) => s.settleEntry);
  const deleteEntry = useAppStore((s) => s.deleteEntry);

  if (!ledger) return null;
  const person = getPerson(ledger, params.id);
  if (!person) {
    return (
      <div className="phone-shell page-pad">
        <p>Person not found.</p>
        <Link href="/ledger" className="text-[var(--accent)]">
          Back
        </Link>
      </div>
    );
  }

  const entries = ledger.entries
    .filter((e) => e.personId === person.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  function confirmAction(message: string, run: () => void) {
    if (prefs.confirmActions && !window.confirm(message)) return;
    run();
  }

  return (
    <div className="phone-shell page-pad">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 text-[14px] font-semibold text-[var(--accent)]"
      >
        <ChevronLeft size={18} /> Back
      </button>

      <div className="mb-6 flex items-center gap-3 fade-up">
        <Avatar name={person.name} color={person.color} size={56} />
        <div>
          <h1
            className="text-[28px] font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {person.name}
          </h1>
          <p className="text-sm text-[var(--ink-muted)]">
            {entries.length} {entries.length === 1 ? "record" : "records"}
          </p>
        </div>
      </div>

      <div className="space-y-2 fade-up fade-up-delay-1">
        {entries.map((entry) => {
          const display = entryDisplayAmount(entry, prefs.currency);
          return (
            <div key={entry.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold">
                    {entry.assetType === "item"
                      ? entry.itemName
                      : formatMoney(entry.amount, prefs.currency)}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[var(--ink-muted)]">
                    {entry.direction === "lend" ? "Lent" : "Borrowed"} ·{" "}
                    {formatLongDate(entry.date)}
                    {entry.settled ? " · Settled" : ""}
                  </p>
                </div>
                <p
                  className={`text-[15px] font-semibold ${
                    display.tone === "lend"
                      ? "tone-lend"
                      : display.tone === "borrow"
                        ? "tone-borrow"
                        : ""
                  }`}
                >
                  {entry.settled ? "Settled" : display.text}
                </p>
              </div>
              {!entry.settled && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-[12px] bg-[var(--accent)] py-2.5 text-[13px] font-semibold text-white"
                    onClick={() =>
                      confirmAction("Mark this as settled?", () =>
                        settleEntry(entry.id),
                      )
                    }
                  >
                    Settle
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-[12px] border border-[var(--line)] py-2.5 text-[13px] font-semibold text-[var(--borrow)]"
                    onClick={() =>
                      confirmAction("Delete this entry?", () => {
                        deleteEntry(entry.id);
                      })
                    }
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
