"use client";
import { celebrate } from "@/lib/celebrate";
import { prettyLabel, renderMatchReason } from "@/lib/labels";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import { WorkerBottomNav } from "@/components/layout/WorkerBottomNav";
import { Badge } from "@/components/ui";
import { ErrorBanner } from "@/components/ui/Feedback";
import { Link, useRouter } from "@/i18n/navigation";
import { WORKER_CATEGORIES, SKILLS_MAP, TOOLS, PAKISTAN_CITIES } from "@/lib/constants";

interface OfferJob {
  id: string;
  title: string;
  workerType: string;
  requiredSkills: string[];
  numberOfWorkers: number;
  date: string;
  startTimeHour: number;
  startTimeMinute: number;
  startTimePeriod: string;
  endTimeHour: number;
  endTimeMinute: number;
  endTimePeriod: string;
  wage: number;
  toolsRequired: string[];
  locationName: string | null;
  status: string;
  employer: { name: string; phone: string };
  employerPhone: string | null;
}

interface OfferItem {
  id: string;
  status: string;
  matchScore: number | null;
  createdAt: string;
  job: OfferJob;
  matchReason: string | null;
}

export default function WorkerOffersPage() {
  const t = useTranslations("Offers");
  const jobsT = useTranslations("Jobs");
  const feedbackT = useTranslations("Feedback");
  const commonT = useTranslations("Common");
  const mrT = useTranslations("MatchReason");
  const locale = useLocale() as "en" | "ur";
  const router = useRouter();

  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    async function loadOffers() {
      try {
        const res = await fetch("/api/worker/offers");
        if (res.ok) {
          const data = await res.json();
          setOffers(data.offers || []);
        }
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }
    loadOffers();
  }, []);

  function getCategoryName(id: string) {
    return WORKER_CATEGORIES.find((c) => c.id === id)?.[locale] || prettyLabel(id);
  }

  function getCityName(id: string | null) {
    if (!id) return "—";
    return PAKISTAN_CITIES.find((c) => c.id === id)?.[locale] || prettyLabel(id);
  }

  function formatTime(h: number, m: number, p: string) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${p}`;
  }

  async function handleAction(offerId: string, action: "ACCEPT" | "DECLINE") {
    setProcessingId(offerId);
    try {
      const res = await fetch(`/api/worker/offers/${offerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        // Always reload so contact details and auto-declined statuses are fresh
        const refreshRes = await fetch("/api/worker/offers");
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setOffers(refreshData.offers || []);

          // Show employer contact immediately after acceptance
          if (data.status === "ACCEPTED") {
            celebrate();
            const accepted = (refreshData.offers || []).find(
              (o: OfferItem) => o.id === offerId
            );
            if (accepted?.job.employerPhone) {
              setSuccessMsg(
                t("acceptedContactShared", { phone: accepted.job.employerPhone })
              );
            } else {
              setSuccessMsg(t("offerAccepted"));
            }
          }
        } else if (data.status === "ACCEPTED") {
          setSuccessMsg(t("offerAccepted"));
        }
      }
    } catch {
      setLoadError(true);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-8">
        {/* Header Banner */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primarystrong p-6 text-white shadow-lg shadow-primary/25">
          <h1 className="text-2xl font-bold">{t("jobOffers")}</h1>
          <p className="mt-1 text-sm text-white/80">{t("subtitle")}</p>
        </div>

        {loadError && (
          <div className="mb-4">
            <ErrorBanner message={commonT("error")} retryLabel={commonT("retry")} onRetry={() => window.location.reload()} />
          </div>
        )}

        {/* Success banner with employer contact after acceptance */}
        {successMsg && (
          <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl border border-success/30 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-successsoft text-success">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-success">{successMsg}</p>
              <Link
                href="/notifications"
                className="mt-1 inline-block text-xs font-semibold text-success underline underline-offset-2 hover:text-success"
              >
                {t("viewNotifications")}
              </Link>
            </div>
            <button
              onClick={() => setSuccessMsg(null)}
              className="shrink-0 rounded-lg p-1 text-green-400 transition hover:bg-successsoft hover:text-success"
              aria-label={commonT("close")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="flex items-center gap-3 text-muted">
              <svg className="h-6 w-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{t("processingOffer")}</span>
            </div>
          </div>
        ) : offers.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-ink">{t("noOffers")}</h2>
            <p className="text-sm text-muted">{t("noOffersDesc")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => {
              const job = offer.job;
              const isProcessing = processingId === offer.id;
              const isPending = offer.status === "PENDING";
              const isAccepted = offer.status === "ACCEPTED";
              const isDeclined = offer.status === "DECLINED";

              return (
                <div
                  key={offer.id}
                  data-testid="offer-card"
                  className="rounded-2xl border border-line bg-surface p-5 shadow-sm"
                >
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-ink">{job.title}</h3>
                      <p className="text-sm text-muted">{job.employer.name}</p>
                    </div>
                    {isPending && (
                      <Badge tone="warning">{t("pending")}</Badge>
                    )}
                    {isAccepted && (
                      <Badge tone="success">{t("accepted")}</Badge>
                    )}
                    {isDeclined && (
                      <Badge tone="default">{t("declined")}</Badge>
                    )}
                  </div>

                  {/* Details */}
                  <div className="mb-3 space-y-2 text-sm text-muted">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>{getCategoryName(job.workerType)} · {job.numberOfWorkers} {jobsT("professionals")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                      </svg>
                      <span>
                        {new Date(job.date).toLocaleDateString(locale === "ur" ? "ur-PK" : "en-PK", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>
                        {formatTime(job.startTimeHour, job.startTimeMinute, job.startTimePeriod)} — {formatTime(job.endTimeHour, job.endTimeMinute, job.endTimePeriod)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" x2="12" y1="2" y2="22" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      <span className="font-semibold text-ink">{job.wage.toLocaleString()} PKR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{getCityName(job.locationName)}</span>
                    </div>
                  </div>

                  {typeof offer.matchScore === "number" && offer.matchScore > 0 && (
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primarysoft px-3 py-1 text-xs font-bold text-primary">
                      ⚡ {offer.matchScore}% match
                    </div>
                  )}
                  {offer.matchReason && (
                    <p className="mb-3 text-xs text-muted">✨ {renderMatchReason(offer.matchReason, (k, v) => mrT(k, v))}</p>
                  )}
                  {/* Employer Phone (after acceptance) */}
                  {isAccepted && job.employerPhone && (
                    <div className="mb-3 flex items-center gap-2 rounded-lg bg-successsoft p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      <div>
                        <div className="text-xs text-success">{t("employerPhone")}</div>
                        <div className="text-sm font-semibold text-success">{job.employerPhone}</div>
                      </div>
                    </div>
                  )}

                  {/* Feedback link for completed accepted jobs */}
                  {isAccepted && job.status === "COMPLETED" && (
                    <button
                      onClick={() => router.push(`/feedback/${job.id}?subjectId=&type=WORKER_TO_EMPLOYER&name=${encodeURIComponent(job.employer.name)}`)}
                      className="mb-3 w-full rounded-xl border border-primary/30 bg-primarysoft py-2.5 text-sm font-semibold text-primary transition hover:bg-primarysoft"
                    >
                      {feedbackT("rateEmployer")}: {job.employer.name}
                    </button>
                  )}

                  {/* Action Buttons */}
                  {isPending && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAction(offer.id, "ACCEPT")} data-testid="accept-offer"
                        disabled={isProcessing}
                        className="flex-1 rounded-xl bg-success py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-success/90 disabled:opacity-50"
                      >
                        {isProcessing ? t("processingOffer") : t("acceptOffer")}
                      </button>
                      <button
                        onClick={() => handleAction(offer.id, "DECLINE")}
                        disabled={isProcessing}
                        className="flex-1 rounded-xl border border-line bg-white py-3 text-sm font-semibold text-ink transition hover:bg-surface2 disabled:opacity-50"
                      >
                        {isProcessing ? t("processingOffer") : t("declineOffer")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <WorkerBottomNav />
    </>
  );
}