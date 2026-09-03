"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import Navbar from "@/components/layout/Navbar";
import { EmployerBottomNav } from "@/components/layout/EmployerBottomNav";
import { Badge, Button } from "@/components/ui";
import {
  WORKER_CATEGORIES,
  SKILLS_MAP,
  TOOLS,
  PAKISTAN_CITIES,
  EXPERIENCE_LEVELS,
} from "@/lib/constants";
import { prettyLabel } from "@/lib/labels";

interface OfferData {
  id: string;
  workerId: string;
  workerName: string;
  workerPhone: string | null;
  status: string;
  matchScore: number | null;
  workerProfile: {
    workerType: string;
    skills: string[];
    experience: number;
    locationName: string | null;
    avgRating: number;
    totalJobs: number;
  } | null;
}

interface PaymentData {
  status: string;
  totalAmount: number;
  securedAt: string | null;
  releasedAt: string | null;
}

interface JobDetail {
  id: string;
  title: string;
  description: string | null;
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
  payment: PaymentData | null;
  offers: OfferData[];
  offerCounts: {
    total: number;
    pending: number;
    accepted: number;
    declined: number;
  };
}

export default function JobDetailPage() {
  const t = useTranslations("Jobs");
  const commonT = useTranslations("Common");
  const jcT = useTranslations("JobComplete");
  const feedbackT = useTranslations("Feedback");
  const paymentT = useTranslations("Payment");
  const locale = useLocale() as "en" | "ur";
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionIsError, setActionIsError] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showSecureConfirm, setShowSecureConfirm] = useState(false);
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false);

  useEffect(() => {
    async function loadJob() {
      try {
        const res = await fetch(`/api/employer/jobs/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setJob(data.job);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    if (jobId) loadJob();
  }, [jobId]);

  function getCategoryName(id: string) {
    return WORKER_CATEGORIES.find((c) => c.id === id)?.[locale] || prettyLabel(id);
  }

  function getSkillName(id: string) {
    for (const skills of Object.values(SKILLS_MAP)) {
      const found = skills.find((s) => s.id === id);
      if (found) return found[locale];
    }
    return id;
  }

  function getToolName(id: string) {
    return TOOLS.find((t) => t.id === id)?.[locale] || prettyLabel(id);
  }

  function getCityName(id: string) {
    return PAKISTAN_CITIES.find((c) => c.id === id)?.[locale] || prettyLabel(id);
  }

  function experienceLabel(years: number) {
    const level = EXPERIENCE_LEVELS.find(
      (l) =>
        (l.id === "beginner" && years <= 1) ||
        (l.id === "intermediate" && years >= 2 && years <= 4) ||
        (l.id === "experienced" && years >= 5 && years <= 9) ||
        (l.id === "expert" && years >= 10)
    );
    return level ? level[locale] : `${years} years`;
  }

  function formatTime(h: number, m: number, p: string) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${p}`;
  }

  function getStatusBadge(status: string) {
    const map: Record<string, { tone: "success" | "warning" | "danger" | "info" | "default" | "purple"; label: string }> = {
      OPEN: { tone: "info", label: t("statusOpen") },
      DRAFT: { tone: "default", label: t("statusDraft") },
      MATCHING: { tone: "purple", label: t("statusMatching") },
      OFFERS_SENT: { tone: "warning", label: t("statusOffersSent") },
      IN_PROGRESS: { tone: "warning", label: t("statusInProgress") },
      COMPLETED: { tone: "success", label: t("statusCompleted") },
      CANCELLED: { tone: "danger", label: t("statusCancelled") },
    };
    return map[status] || { tone: "default" as const, label: status };
  }

  function getPaymentBadge(status: string) {
    const map: Record<string, { tone: "success" | "warning" | "info" | "default"; label: string }> = {
      SECURED: { tone: "info", label: paymentT("secured") },
      HELD: { tone: "warning", label: paymentT("held") },
      REFUNDED: { tone: "info", label: paymentT("refunded") },
      RELEASED: { tone: "success", label: paymentT("released") },
      CANCELLED: { tone: "default", label: paymentT("refunded") },
    };
    return map[status] || { tone: "default" as const, label: paymentT("notSecured") };
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch(`/api/employer/jobs/${jobId}/cancel`, { method: "POST" });
      if (res.ok) {
        setJob((prev) =>
          prev
            ? {
                ...prev,
                status: "CANCELLED",
                payment:
                  prev.payment &&
                  ["SECURED", "HELD", "PENDING"].includes(prev.payment.status)
                    ? { ...prev.payment, status: "REFUNDED" }
                    : prev.payment,
              }
            : null
        );
        setShowCancelConfirm(false);
        setActionIsError(false);
        setActionMessage(jcT("jobCancelledRefund"));
      }
    } catch {
      // silently fail
    } finally {
      setCancelling(false);
    }
  }

  async function handlePaymentAction(action: "SECURE" | "RELEASE") {
    setPaymentProcessing(true);
    try {
      const res = await fetch(`/api/employer/jobs/${jobId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setJob((prev) => (prev ? { ...prev, payment: data.payment } : null));
        setShowSecureConfirm(false);
        setShowReleaseConfirm(false);
        setActionIsError(false);
        setActionMessage(
          action === "SECURE"
            ? paymentT("paymentSecured")
            : paymentT("paymentReleased")
        );
      } else {
        setActionIsError(true);
        setActionMessage(data.error || paymentT("paymentError"));
      }
    } catch {
      setActionIsError(true);
      setActionMessage(paymentT("paymentError"));
    } finally {
      setPaymentProcessing(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-muted">
            <svg className="h-6 w-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>{commonT("loading")}</span>
          </div>
        </div>
        <EmployerBottomNav />
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center text-muted">
          <p>Job not found</p>
        </div>
        <EmployerBottomNav />
      </>
    );
  }

  const badge = getStatusBadge(job.status);
  const canCancel = ["OPEN", "DRAFT", "OFFERS_SENT", "MATCHING"].includes(job.status);
  const acceptedCount = job.offerCounts?.accepted ?? 0;

  // Payment / escrow state
  const payment = job.payment;
  const paymentTotal = job.wage * job.numberOfWorkers;
  const jobIsActive = job.status !== "COMPLETED" && job.status !== "CANCELLED";
  const canSecure = !payment && jobIsActive;
  const canRelease =
    job.status === "COMPLETED" &&
    !!payment &&
    (payment.status === "HELD" || payment.status === "SECURED");

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-8">
        {/* Back link */}
        <button
          onClick={() => router.push("/employer/jobs")}
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          {commonT("back")}
        </button>

        {/* Status + Title */}
        <div className="mb-4 flex items-start justify-between">
          <h1 className="text-2xl font-bold text-ink">{job.title}</h1>
          <Badge tone={badge.tone}>{badge.label}</Badge>
        </div>

        {/* Progress bar for positions */}
        <div className="mb-6 rounded-xl bg-surface2 p-3">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="font-medium text-ink">{t("professionals")}</span>
            <span className="font-semibold text-ink">{acceptedCount}/{job.numberOfWorkers}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-300">
            <div
              className="h-full rounded-full bg-successsoft0 transition-all"
              style={{ width: `${job.numberOfWorkers > 0 ? (acceptedCount / job.numberOfWorkers) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Job Details Card */}
        <div className="mb-6 space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-sm">
          {/* Type + Skills */}
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted">{t("professionalType")}</div>
            <div className="mt-1 font-semibold text-ink">{getCategoryName(job.workerType)}</div>
          </div>

          {job.requiredSkills.length > 0 && (
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted">{t("requiredSkills")}</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {job.requiredSkills.map((sId) => (
                  <span key={sId} className="rounded-lg bg-primarysoft px-2.5 py-1 text-xs font-medium text-primary">
                    {getSkillName(sId)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface2 p-3">
              <div className="text-xs text-muted">{t("jobDate")}</div>
              <div className="mt-0.5 text-sm font-semibold text-ink">
                {new Date(job.date).toLocaleDateString(locale === "ur" ? "ur-PK" : "en-PK", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </div>
            </div>
            <div className="rounded-xl bg-surface2 p-3">
              <div className="text-xs text-muted">{t("peopleNeeded")}</div>
              <div className="mt-0.5 text-sm font-semibold text-ink">{job.numberOfWorkers}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface2 p-3">
              <div className="text-xs text-muted">{t("startTime")}</div>
              <div className="mt-0.5 text-sm font-semibold text-ink">
                {formatTime(job.startTimeHour, job.startTimeMinute, job.startTimePeriod)}
              </div>
            </div>
            <div className="rounded-xl bg-surface2 p-3">
              <div className="text-xs text-muted">{t("endTime")}</div>
              <div className="mt-0.5 text-sm font-semibold text-ink">
                {formatTime(job.endTimeHour, job.endTimeMinute, job.endTimePeriod)}
              </div>
            </div>
          </div>

          {/* Wage */}
          <div className="rounded-xl bg-primarysoft p-3">
            <div className="text-xs text-primary">{t("wagePerPerson")}</div>
            <div className="mt-0.5 text-lg font-bold text-blue-800">{job.wage.toLocaleString()} PKR</div>
            {job.numberOfWorkers > 1 && (
              <div className="text-xs text-primary">
                {t("totalCost")}: {(job.wage * job.numberOfWorkers).toLocaleString()} PKR
              </div>
            )}
          </div>

          {/* Tools */}
          {job.toolsRequired.length > 0 && (
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted">{t("toolsProvided")}</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {job.toolsRequired.map((tId) => (
                  <span key={tId} className="rounded-lg bg-surface2 px-2.5 py-1 text-xs font-medium text-ink">
                    {getToolName(tId)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          {job.locationName && (
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted">{t("jobLocation")}</div>
              <div className="mt-1 font-semibold text-ink">{getCityName(job.locationName)}</div>
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted">{t("additionalDetails")}</div>
              <p className="mt-1 text-sm text-ink">{job.description}</p>
            </div>
          )}
        </div>

        {/* Payment / Escrow Card */}
        {(canSecure || payment) && (
          <div className={`mb-6 rounded-2xl border bg-surface p-5 shadow-sm ${canSecure ? "border-primary/30" : "border-line"}`}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
                {paymentT("title")}
              </h2>
              {payment && (
                <Badge tone={getPaymentBadge(payment.status).tone}>
                  {getPaymentBadge(payment.status).label}
                </Badge>
              )}
            </div>

            {/* Amount */}
            <div className="mb-3 rounded-xl bg-surface2 p-3">
              <div className="text-xs text-muted">{paymentT("total")}</div>
              <div className="mt-0.5 text-lg font-bold text-ink">
                {(payment?.totalAmount ?? paymentTotal).toLocaleString()} PKR
              </div>
              {payment?.securedAt && (
                <div className="mt-1 text-xs text-muted">
                  {paymentT("securedAt")}{" "}
                  {new Date(payment.securedAt).toLocaleDateString(
                    locale === "ur" ? "ur-PK" : "en-PK",
                    { year: "numeric", month: "short", day: "numeric" }
                  )}
                </div>
              )}
              {payment?.releasedAt && (
                <div className="mt-1 text-xs text-muted">
                  {paymentT("releasedAt")}{" "}
                  {new Date(payment.releasedAt).toLocaleDateString(
                    locale === "ur" ? "ur-PK" : "en-PK",
                    { year: "numeric", month: "short", day: "numeric" }
                  )}
                </div>
              )}
            </div>

            {/* Status description */}
            {payment?.status === "SECURED" && (
              <p className="mb-3 text-sm text-muted">{paymentT("securedDesc")}</p>
            )}
            {payment?.status === "HELD" && (
              <p className="mb-3 text-sm text-muted">{paymentT("heldDesc")}</p>
            )}
            {payment?.status === "RELEASED" && (
              <p className="mb-3 text-sm text-success">{paymentT("releasedDesc")}</p>
            )}
            {payment?.status === "CANCELLED" && (
              <p className="mb-3 text-sm text-muted">{paymentT("refundedDesc")}</p>
            )}

            {/* Secure Payment action */}
            {canSecure &&
              (!showSecureConfirm ? (
                <div>
                  <p className="mb-3 text-sm text-muted">{paymentT("notSecuredDesc")}</p>
                  <button
                    onClick={() => setShowSecureConfirm(true)}
                    className="w-full rounded-xl bg-primary py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    {paymentT("securePayment")}
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-primary/30 bg-primarysoft p-4">
                  <p className="mb-3 text-sm font-medium text-primary">
                    {paymentT("secureDesc", { amount: paymentTotal.toLocaleString() })}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handlePaymentAction("SECURE")}
                      disabled={paymentProcessing}
                      className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      {paymentProcessing ? commonT("loading") : paymentT("confirmSecure")}
                    </button>
                    <button onClick={() => setShowSecureConfirm(false)} className="flex-1 rounded-xl border border-line bg-white py-2.5 text-sm font-semibold text-ink transition hover:bg-surface2">
                      {commonT("cancel")}
                    </button>
                  </div>
                </div>
              ))}

            {/* Release Payment action */}
            {canRelease &&
              (!showReleaseConfirm ? (
                <button
                  onClick={() => setShowReleaseConfirm(true)}
                  className="w-full rounded-xl bg-success py-3 text-base font-semibold text-white shadow-sm transition hover:bg-success/90"
                >
                  {paymentT("releasePayment")}
                </button>
              ) : (
                <div className="rounded-2xl border border-success/30 bg-successsoft p-4">
                  <p className="mb-3 text-sm font-medium text-success">
                    {paymentT("releaseDesc", {
                      amount: (payment?.totalAmount ?? paymentTotal).toLocaleString(),
                    })}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handlePaymentAction("RELEASE")}
                      disabled={paymentProcessing}
                      className="flex-1 rounded-xl bg-success py-2.5 text-sm font-semibold text-white transition hover:bg-success/90 disabled:opacity-50"
                    >
                      {paymentProcessing ? commonT("loading") : paymentT("confirmRelease")}
                    </button>
                    <button onClick={() => setShowReleaseConfirm(false)} className="flex-1 rounded-xl border border-line bg-white py-2.5 text-sm font-semibold text-ink transition hover:bg-surface2">
                      {commonT("cancel")}
                    </button>
                  </div>
                </div>
              ))}

            <p className="mt-3 text-xs text-muted">{paymentT("simulatedNote")}</p>
          </div>
        )}

        {/* Offers Section */}
        {job.offers.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-ink">
              {t("professionals")} ({job.offers.length})
            </h2>
            <div className="space-y-3">
              {job.offers.map((offer) => {
                const offerBadge =
                  offer.status === "ACCEPTED"
                    ? { tone: "success" as const, label: t("statusCompleted").replace(t("statusCompleted"), commonT("selected")) }
                    : offer.status === "DECLINED"
                    ? { tone: "danger" as const, label: commonT("remove") }
                    : { tone: "warning" as const, label: t("statusOpen") };

                return (
                  <div
                    key={offer.id}
                    className="rounded-2xl border border-line bg-surface p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-ink">{offer.workerName}</div>
                          {offer.workerProfile && (
                            <div className="text-xs text-muted">
                              {experienceLabel(offer.workerProfile.experience)} · ★ {offer.workerProfile.avgRating.toFixed(1)}
                            </div>
                          )}
                          {offer.workerPhone && (
                            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-success">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                              {offer.workerPhone}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge tone={offerBadge.tone}>{offerBadge.label}</Badge>
                        {offer.matchScore != null && (
                          <span className="text-xs text-muted">{offer.matchScore}% {t("matchScore")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Message */}
        {actionMessage && (
          <div
            role={actionIsError ? "alert" : "status"}
            className={`mb-4 rounded-lg border p-3 text-sm ${
              actionIsError
                ? "border-danger/30 bg-dangersoft text-danger"
                : "border-success/30 bg-successsoft text-success"
            }`}
          >
            {actionMessage}
          </div>
        )}

        {/* Complete Job Button (IN_PROGRESS) */}
        {job.status === "IN_PROGRESS" && (
          <div className="mb-4">
            {!showCompleteConfirm ? (
              <button
                onClick={() => setShowCompleteConfirm(true)} data-testid="complete-trigger"
                className="w-full rounded-xl bg-success py-3 text-base font-semibold text-white shadow-sm transition hover:bg-success/90"
              >
                {jcT("completeJob")}
              </button>
            ) : (
              <div className="rounded-2xl border border-success/30 bg-successsoft p-4">
                <p className="mb-3 text-sm font-medium text-success">{jcT("confirmComplete")}</p>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      setCompleting(true);
                      try {
                        const res = await fetch(`/api/employer/jobs/${jobId}/complete`, { method: "POST" });
                        if (res.ok) {
                          setJob((prev) => prev ? { ...prev, status: "COMPLETED" } : null);
                          setShowCompleteConfirm(false);
                          setActionMessage(jcT("jobCompleted"));
                        }
                      } catch {} finally { setCompleting(false); }
                    }}
                    disabled={completing} data-testid="complete-confirm"
                    className="flex-1 rounded-xl bg-success py-2.5 text-sm font-semibold text-white transition hover:bg-success/90 disabled:opacity-50"
                  >
                    {completing ? commonT("loading") : commonT("confirm")}
                  </button>
                  <button onClick={() => setShowCompleteConfirm(false)} className="flex-1 rounded-xl border border-line bg-white py-2.5 text-sm font-semibold text-ink transition hover:bg-surface2">
                    {commonT("cancel")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feedback Links (COMPLETED) */}
        {job.status === "COMPLETED" && job.offers.filter((o) => o.status === "ACCEPTED").length > 0 && (
          <div className="mb-4 space-y-2">
            {job.offers.filter((o) => o.status === "ACCEPTED").map((offer) => (
              <button
                key={offer.id}
                onClick={() => router.push(`/feedback/${jobId}?subjectId=${offer.workerId}&type=EMPLOYER_TO_WORKER&name=${encodeURIComponent(offer.workerName)}`)}
                className="w-full rounded-xl border border-primary/30 bg-primarysoft py-3 text-sm font-semibold text-primary transition hover:bg-primarysoft"
              >
                {feedbackT("rateWorker")}: {offer.workerName}
              </button>
            ))}
          </div>
        )}

        {/* Delete Job Button (no accepted workers) */}
        {acceptedCount === 0 && !canCancel && job.status !== "COMPLETED" && job.status !== "CANCELLED" && (
          <div className="mb-4">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full rounded-xl border border-danger/30 bg-white py-3 text-base font-semibold text-red-600 transition hover:bg-red-50"
              >
                {jcT("deleteJob")}
              </button>
            ) : (
              <div className="rounded-2xl border border-danger/30 bg-dangersoft p-4">
                <p className="mb-3 text-sm font-medium text-danger">{jcT("confirmDelete")}</p>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      setDeleting(true);
                      try {
                        const res = await fetch(`/api/employer/jobs/${jobId}`, { method: "DELETE" });
                        if (res.ok) {
                          setJob((prev) => prev ? { ...prev, status: "CANCELLED" } : null);
                          setShowDeleteConfirm(false);
                          setActionMessage(jcT("jobDeleted"));
                        } else {
                          const data = await res.json();
                          setActionMessage(data.error || commonT("error"));
                        }
                      } catch {} finally { setDeleting(false); }
                    }}
                    disabled={deleting}
                    className="flex-1 rounded-xl bg-danger py-2.5 text-sm font-semibold text-white transition hover:bg-danger/90 disabled:opacity-50"
                  >
                    {deleting ? commonT("loading") : commonT("confirm")}
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-xl border border-line bg-white py-2.5 text-sm font-semibold text-ink transition hover:bg-surface2">
                    {commonT("cancel")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delete prevention message */}
        {acceptedCount > 0 && !canCancel && job.status !== "COMPLETED" && job.status !== "CANCELLED" && (
          <div className="mb-4 rounded-xl border border-accent/30 bg-accentsoft p-3 text-sm text-accent">
            {jcT("cannotDeleteAccepted")}
          </div>
        )}

        {/* Cancel Button */}
        {canCancel && (
          <>
            {!showCancelConfirm ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full rounded-xl border border-danger/30 bg-white py-3 text-base font-semibold text-red-600 transition hover:bg-red-50"
              >
                {t("cancelJob")}
              </button>
            ) : (
              <div className="rounded-2xl border border-danger/30 bg-dangersoft p-4">
                <p className="mb-3 text-sm font-medium text-danger">{t("cancelConfirm")}</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="flex-1 rounded-xl bg-danger py-2.5 text-sm font-semibold text-white transition hover:bg-danger/90 disabled:opacity-50"
                  >
                    {cancelling ? commonT("loading") : commonT("confirm")}
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 rounded-xl border border-line bg-white py-2.5 text-sm font-semibold text-ink transition hover:bg-surface2"
                  >
                    {commonT("cancel")}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <EmployerBottomNav />
    </>
  );
}