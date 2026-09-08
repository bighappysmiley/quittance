"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { useActiveLedger, useAppStore, usePrefs } from "@/store/useAppStore";
import { getPerson } from "@/lib/ledger";
import {
  activitySentence,
  entryDisplayAmount,
  formatLongDate,
  formatMoney,
} from "@/lib/format";

export default function EntryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const ledger = useActiveLedger();
  const prefs = usePrefs();
  const settleEntry = useAppStore((s) => s.settleEntry);
  const deleteEntry = useAppStore((s) => s.deleteEntry);

  if (!ledger) return null;
  const entry = ledger.entries.find((e) => e.id === params.id);
  if (!entry) {
    return (
      <div className="phone-shell page-pad">
        <p>Entry not found.</p>
        <Link href="/activity" className="text-[var(--accent)]">
          Back
        </Link>
      </div>
    );
  }

  const person = getPerson(ledger, entry.personId);
  const display = entryDisplayAmount(entry, prefs.currency);

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

      <div className="card p-5 fade-up">
        {person && (
          <div className="mb-4 flex items-center gap-3">
            <Avatar name={person.name} color={person.color} />
            <div>
              <p className="font-semibold">{person.name}</p>
              <p className="text-xs text-[var(--ink-muted)]">
                {formatLongDate(entry.date)}
              </p>
            </div>
          </div>
        )}
        <p className="text-[15px] leading-relaxed text-[var(--ink-muted)]">
          {activitySentence(entry, person, prefs.currency)}
        </p>
        <p
          className={`mt-4 text-[36px] font-semibold tracking-tight ${
            display.tone === "lend"
              ? "tone-lend"
              : display.tone === "borrow"
                ? "tone-borrow"
                : ""
          }`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {entry.assetType === "money"
            ? formatMoney(
                entry.direction === "lend" ? entry.amount : -entry.amount,
                prefs.currency,
                { signed: true },
              )
            : display.text}
        </p>
        {entry.paid > 0 && entry.assetType === "money" && (
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            {formatMoney(entry.paid, prefs.currency)} already paid
          </p>
        )}
        {entry.expectedBack && (
          <p className="mt-3 text-sm text-[var(--ink-muted)]">
            Expected back {formatLongDate(entry.expectedBack)}
          </p>
        )}
        {entry.photoDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.photoDataUrl}
            alt=""
            className="mt-4 max-h-56 w-full rounded-[14px] object-cover"
          />
        )}
        {entry.settled ? (
          <p className="mt-5 text-sm font-semibold text-[var(--accent)]">
            Settled {entry.settledAt ? formatLongDate(entry.settledAt) : ""}
          </p>
        ) : (
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-[12px] bg-[var(--accent)] py-3 text-[14px] font-semibold text-white"
              onClick={() =>
                confirmAction("Mark this as settled?", () => {
                  settleEntry(entry.id);
                  router.back();
                })
              }
            >
              Settle
            </button>
            <button
              type="button"
              className="flex-1 rounded-[12px] border border-[var(--line)] py-3 text-[14px] font-semibold text-[var(--borrow)]"
              onClick={() =>
                confirmAction("Delete this entry?", () => {
                  deleteEntry(entry.id);
                  router.replace("/activity");
                })
              }
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
