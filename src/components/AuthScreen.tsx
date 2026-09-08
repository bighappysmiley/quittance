"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Cloud } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function AuthScreen() {
  const router = useRouter();
  const signIn = useAppStore((s) => s.signIn);
  const signUp = useAppStore((s) => s.signUp);
  const tryDemo = useAppStore((s) => s.tryDemo);
  const session = useAppStore((s) => s.session);

  const [mode, setMode] = useState<"in" | "up">("in");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) router.replace("/ledger");
  }, [session, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err =
      mode === "in"
        ? await signIn(username, password)
        : await signUp(username, password, false);
    setBusy(false);
    if (err) setError(err);
    else router.replace("/ledger");
  }

  async function onDemo() {
    setBusy(true);
    await tryDemo();
    setBusy(false);
    router.replace("/ledger");
  }

  return (
    <div className="phone-shell page-pad flex min-h-dvh flex-col justify-between">
      <div className="fade-up pt-10">
        <p className="section-label mb-3">Private ledger</p>
        <h1
          className="font-[family-name:var(--font-display)] text-[42px] leading-[1.05] tracking-[-0.03em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Quittance
        </h1>
        <p className="mt-3 max-w-[18rem] text-[15px] leading-relaxed text-[var(--ink-muted)]">
          Track who owes what — money or things — synced to your account, seen
          only by you.
        </p>
      </div>

      <div className="fade-up fade-up-delay-1 relative my-8 overflow-hidden rounded-[28px] border border-[var(--line)] shadow-[var(--shadow-card)]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(165deg, #1f3d32 0%, #182029 48%, #2c211c 100%)",
          }}
        />
        <div className="relative flex aspect-[4/3] flex-col p-5 text-white">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Cloud size={16} />
            Sample ledger
          </div>
          <p className="mt-auto text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
            Net position
          </p>
          <p
            className="mt-1 text-[44px] font-semibold tracking-tight text-[#e8c4b4]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            −$38
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3 text-sm">
            <div>
              <p className="text-white/45">Owed to you</p>
              <p className="mt-0.5 text-lg font-semibold text-[#8fd6b0]">$2</p>
            </div>
            <div>
              <p className="text-white/45">You owe</p>
              <p className="mt-0.5 text-lg font-semibold text-[#e8c4b4]">$40</p>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="fade-up fade-up-delay-2 card mb-4 space-y-3 p-4"
      >
        <div className="segmented mb-1">
          <button
            type="button"
            data-active={mode === "in"}
            onClick={() => setMode("in")}
          >
            Sign in
          </button>
          <button
            type="button"
            data-active={mode === "up"}
            onClick={() => setMode("up")}
          >
            Create account
          </button>
        </div>
        <input
          className="input-field"
          placeholder="Username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="input-field"
          placeholder="Password"
          type="password"
          autoComplete={mode === "in" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p className="text-sm text-[var(--danger)]" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-[14px] bg-[var(--accent)] px-4 py-3.5 text-[15px] font-semibold text-white transition hover:brightness-105 disabled:opacity-60"
        >
          {busy ? "Working…" : mode === "in" ? "Sign in" : "Create account"}
        </button>
        <button
          type="button"
          onClick={onDemo}
          disabled={busy}
          className="w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 text-[14px] font-semibold text-[var(--ink)]"
        >
          Open demo ledger
        </button>
      </form>

      <p className="fade-up fade-up-delay-3 pb-4 text-center text-xs text-[var(--ink-faint)]">
        Data stays on this device for now. Export anytime from Settings.
      </p>
    </div>
  );
}
