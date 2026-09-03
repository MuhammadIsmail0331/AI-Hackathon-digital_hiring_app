/**
 * Shared status badge + formatting helpers.
 * Replaces the duplicated getStatusBadge copies across pages.
 */

export type StatusTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "default"
  | "purple"
  | "expired";

type BadgeSpec = { tone: StatusTone; labelKey: string };

/**
 * labelKey is resolved against the caller's `Jobs` namespace translator.
 */
const JOB_STATUS_MAP: Record<string, BadgeSpec> = {
  DRAFT: { tone: "default", labelKey: "statusDraft" },
  OPEN: { tone: "info", labelKey: "statusOpen" },
  MATCHING: { tone: "purple", labelKey: "statusMatching" },
  OFFERS_SENT: { tone: "warning", labelKey: "statusOffersSent" },
  IN_PROGRESS: { tone: "warning", labelKey: "statusInProgress" },
  COMPLETED: { tone: "success", labelKey: "statusCompleted" },
  CANCELLED: { tone: "danger", labelKey: "statusCancelled" },
  EXPIRED: { tone: "expired", labelKey: "statusExpired" },
};

export function getStatusBadge(
  status: string,
  t: (key: string) => string
): { tone: StatusTone; label: string } {
  const spec = JOB_STATUS_MAP[status];
  if (!spec) return { tone: "default", label: status };
  return { tone: spec.tone, label: t(spec.labelKey) };
}

export function formatPKR(amount: number): string {
  return `${amount.toLocaleString("en-PK")} PKR`;
}

export function formatJobDate(iso: string, locale: "en" | "ur"): string {
  return new Date(iso).toLocaleDateString(locale === "ur" ? "ur-PK" : "en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
