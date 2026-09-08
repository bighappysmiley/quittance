"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="welcome-shell grid min-h-dvh place-items-center px-6 text-center">
      <div className="max-w-sm">
        <p className="brand-mark text-3xl text-[var(--ink)]">Quittance</p>
        <p className="mt-4 text-[15px] text-[var(--ink-muted)]">
          This screen couldn’t open. Try again — if it keeps happening, sign in
          again from the start.
        </p>
        <button
          type="button"
          className="btn-primary mt-6 w-full"
          onClick={() => {
            try {
              reset();
            } catch {
              window.location.assign("/");
            }
          }}
        >
          Try again
        </button>
        <button
          type="button"
          className="btn-secondary mt-3 w-full"
          onClick={() => {
            window.location.assign("/auth/sign-in");
          }}
        >
          Sign in
        </button>
        {error?.digest ? (
          <p className="mt-4 text-[11px] text-[var(--ink-faint)]">
            Ref {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
