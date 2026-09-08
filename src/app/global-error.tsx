"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background:
            "radial-gradient(120% 80% at 50% 0%, #1a2e26 0%, #0e1110 55%, #121416 100%)",
          color: "#e8ece9",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div style={{ maxWidth: 360, textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            Quittance
          </p>
          <p
            style={{
              margin: "16px 0 0",
              fontSize: 15,
              lineHeight: 1.5,
              color: "rgba(232,236,233,0.7)",
            }}
          >
            Quittance hit a snag opening this screen. Try again, or go back to
            sign in.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 24,
            }}
          >
            <button
              type="button"
              onClick={() => {
                try {
                  reset();
                } catch {
                  // fall through to hard reload
                }
                window.location.assign("/");
              }}
              style={{
                border: 0,
                borderRadius: 12,
                padding: "14px 16px",
                background: "#8fd6b0",
                color: "#0e1110",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.assign("/auth/sign-in");
              }}
              style={{
                border: "1px solid rgba(232,236,233,0.18)",
                borderRadius: 12,
                padding: "14px 16px",
                background: "transparent",
                color: "#e8ece9",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              Sign in
            </button>
          </div>
          {error?.digest ? (
            <p
              style={{
                marginTop: 20,
                fontSize: 11,
                color: "rgba(232,236,233,0.35)",
              }}
            >
              Ref {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
