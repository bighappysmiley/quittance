import {
  ACCENTS,
  CURRENCIES,
  DEFAULT_PREFERENCES,
  type AccentId,
  type CurrencyCode,
  type ListDensity,
  type Preferences,
  type ThemeMode,
} from "@/lib/types";

/** AbortSignal.timeout is missing on older Safari — never throw just for a timer. */
export function abortTimeout(ms: number): AbortSignal | undefined {
  try {
    if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
      return AbortSignal.timeout(ms);
    }
  } catch {
    // ignore
  }
  return undefined;
}

const THEMES = new Set<ThemeMode>(["auto", "light", "dark"]);
const DENSITIES = new Set<ListDensity>([
  "compact",
  "comfortable",
  "spacious",
]);
const ACCENT_IDS = new Set<string>(Object.keys(ACCENTS));
const CURRENCY_CODES = new Set<string>(CURRENCIES.map((c) => c.code));

export function sanitizePreferences(
  input: Partial<Preferences> | Record<string, unknown> | undefined | null,
): Preferences {
  const row = (input ?? {}) as Record<string, unknown>;
  const theme = THEMES.has(row.theme as ThemeMode)
    ? (row.theme as ThemeMode)
    : DEFAULT_PREFERENCES.theme;
  const accent = ACCENT_IDS.has(String(row.accent))
    ? (row.accent as AccentId)
    : DEFAULT_PREFERENCES.accent;
  const currency = CURRENCY_CODES.has(String(row.currency))
    ? (row.currency as CurrencyCode)
    : DEFAULT_PREFERENCES.currency;
  const density = DENSITIES.has(row.density as ListDensity)
    ? (row.density as ListDensity)
    : DEFAULT_PREFERENCES.density;
  const confirmRaw = row.confirmActions ?? row.confirm_actions;
  const confirmActions =
    confirmRaw === undefined
      ? DEFAULT_PREFERENCES.confirmActions
      : Boolean(confirmRaw);

  return { theme, accent, currency, density, confirmActions };
}

export function resolveAccent(id: string | undefined) {
  if (id && id in ACCENTS) return ACCENTS[id as AccentId];
  return ACCENTS[DEFAULT_PREFERENCES.accent];
}
