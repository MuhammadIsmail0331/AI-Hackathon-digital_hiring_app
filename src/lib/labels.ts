/**
 * Free-text "Other" value helpers.
 *
 * Custom values (typed city names, skills, worker types) are stored
 * NORMALIZED (lowercase, single-spaced, trimmed) so that exact-match
 * systems (matching engine, worker search) always line up between
 * what an employer types and what a worker types.
 * Display uses prettyLabel() so stored values read naturally.
 */

/** "solar_installation" / "solar installation" -> "Solar Installation" */
export function prettyLabel(id: string | null | undefined): string {
  if (!id) return "";
  return id
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

/** "  Solar   Installation " -> "solar installation" (storage/matching form) */
export function normalizeCustomValue(v: string): string {
  return v.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Renders a stored offer match reason in the active locale.
 * New offers store structured JSON ({skillPct, distKm, wageOk}); legacy
 * rows store a plain English string and are displayed as-is.
 *
 * @param raw   The stored `matchReason` value (JSON or legacy text).
 * @param t     A translator bound to the `MatchReason` namespace,
 *              e.g. `(k, v) => mrT(k, v)` from next-intl.
 */
export function renderMatchReason(
  raw: string | null | undefined,
  t: (key: "skill" | "distance" | "wageOk" | "wageLow", values?: Record<string, string | number>) => string
): string {
  if (!raw) return "";
  try {
    const data = JSON.parse(raw) as {
      skillPct?: number;
      distKm?: number | null;
      wageOk?: boolean;
    };
    if (typeof data.skillPct !== "number") return raw;
    const parts: string[] = [t("skill", { skill: data.skillPct })];
    if (data.distKm != null) parts.push(t("distance", { dist: data.distKm }));
    parts.push(data.wageOk ? t("wageOk") : t("wageLow"));
    return parts.join(" · ");
  } catch {
    return raw; // legacy plain-text reason
  }
}