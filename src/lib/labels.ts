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