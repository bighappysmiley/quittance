"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Package,
  Camera,
  User,
  Users,
} from "lucide-react";
import { DirectionToggle } from "@/components/NetPositionCard";
import { useActiveLedger, useAppStore } from "@/store/useAppStore";
import type { AssetType, Direction, ReminderOption } from "@/lib/types";
import { ITEM_CATEGORIES } from "@/lib/types";
import { format } from "date-fns";

export default function NewRecordPage() {
  const router = useRouter();
  const ledger = useActiveLedger();
  const addEntry = useAppStore((s) => s.addEntry);

  const [direction, setDirection] = useState<Direction>("lend");
  const [assetType, setAssetType] = useState<AssetType>("money");
  const [amount, setAmount] = useState("");
  const [what, setWhat] = useState("");
  const [category, setCategory] = useState<string>("toy");
  const [personName, setPersonName] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [expectedBack, setExpectedBack] = useState("");
  const [reminder, setReminder] = useState<ReminderOption>("none");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();

  const suggestions = useMemo(() => {
    if (!ledger) return [];
    return ledger.people.map((p) => p.name);
  }, [ledger]);

  const canSubmit =
    personName.trim().length > 0 &&
    (assetType === "money"
      ? Number(amount) > 0
      : what.trim().length > 0);

  function onPhoto(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  function submit() {
    if (!canSubmit) return;
    addEntry({
      direction,
      assetType,
      amount: assetType === "money" ? Number(amount) : 0,
      itemName: assetType === "item" ? what.trim() : undefined,
      category: assetType === "item" ? category : undefined,
      photoDataUrl,
      date,
      expectedBack: expectedBack || undefined,
      reminder,
      personName: personName.trim(),
    });
    router.replace("/ledger");
  }

  return (
    <div className="phone-shell min-h-dvh bg-[var(--bg)]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--line)] bg-[var(--bg)]/90 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-[15px] font-semibold text-[var(--accent)]"
        >
          Cancel
        </button>
        <h1 className="text-[16px] font-semibold">New Record</h1>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="text-[15px] font-semibold disabled:text-[var(--ink-faint)]"
          style={{ color: canSubmit ? "var(--accent)" : undefined }}
        >
          Add
        </button>
      </header>

      <div className="space-y-5 px-4 py-4 pb-10">
        <DirectionToggle value={direction} onChange={setDirection} />

        <div className="segmented">
          <button
            type="button"
            data-active={assetType === "money"}
            onClick={() => setAssetType("money")}
            className="!flex !items-center !justify-center !gap-1.5"
          >
            <Banknote size={15} /> Money
          </button>
          <button
            type="button"
            data-active={assetType === "item"}
            onClick={() => setAssetType("item")}
            className="!flex !items-center !justify-center !gap-1.5"
          >
            <Package size={15} /> Item
          </button>
        </div>

        {assetType === "money" ? (
          <input
            className="input-field text-[22px] font-semibold"
            inputMode="decimal"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          />
        ) : (
          <>
            <input
              className="input-field"
              placeholder="What?"
              value={what}
              onChange={(e) => setWhat(e.target.value)}
            />
            <div>
              <p className="mb-2 text-[13px] font-semibold text-[var(--ink-muted)]">
                Category
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {ITEM_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="chip"
                    data-active={category === c.id}
                    onClick={() => setCategory(c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[13px] font-semibold text-[var(--ink-muted)]">
                Add Photo (Optional)
              </p>
              <label className="grid h-24 w-24 cursor-pointer place-items-center rounded-[16px] border border-dashed border-[var(--ink-faint)] bg-[var(--surface)] text-[var(--accent)]">
                {photoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoDataUrl}
                    alt=""
                    className="h-full w-full rounded-[16px] object-cover"
                  />
                ) : (
                  <Camera size={22} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPhoto(e.target.files?.[0])}
                />
              </label>
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold text-[var(--ink-muted)]">
              Date
            </span>
            <input
              type="date"
              className="input-field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold text-[var(--ink-muted)]">
              Expected back (optional)
            </span>
            <input
              type="date"
              className="input-field"
              value={expectedBack}
              onChange={(e) => setExpectedBack(e.target.value)}
            />
          </label>
        </div>

        <div className="relative">
          <User
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]"
          />
          <input
            className="input-field !pl-10 !pr-10"
            placeholder={direction === "lend" ? "To whom?" : "From whom?"}
            list="people-suggestions"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
          />
          <Users
            size={16}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]"
          />
          <datalist id="people-suggestions">
            {suggestions.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </div>

        <div>
          <p className="mb-2 text-[13px] font-semibold text-[var(--ink-muted)]">
            Reminder
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["none", "None"],
                ["tomorrow", "Tomorrow"],
                ["week", "1 Week Later"],
                ["custom", "Select Date"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setReminder(id)}
                className="rounded-[12px] border px-3 py-3 text-[13px] font-semibold"
                style={{
                  borderColor:
                    reminder === id ? "var(--accent)" : "var(--line)",
                  background:
                    reminder === id ? "var(--accent-soft)" : "var(--surface)",
                  color:
                    reminder === id ? "var(--accent-ink)" : "var(--ink-muted)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
