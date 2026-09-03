"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { useRouter } from "@/i18n/navigation";

export default function FeedbackPage() {
  const t = useTranslations("Feedback");
  const commonT = useTranslations("Common");
  const locale = useLocale() as "en" | "ur";
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const jobId = params.jobId as string;
  const subjectId = searchParams.get("subjectId") || "";
  const feedbackType = searchParams.get("type") || "EMPLOYER_TO_WORKER";
  const subjectName = searchParams.get("name") || "";

  const isEmployerToWorker = feedbackType === "EMPLOYER_TO_WORKER";

  const [overallRating, setOverallRating] = useState(0);
  const [punctuality, setPunctuality] = useState(0);
  const [attitude, setAttitude] = useState(0);
  const [workQuality, setWorkQuality] = useState(0);
  const [paymentOnTime, setPaymentOnTime] = useState(0);
  const [fairTreatment, setFairTreatment] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if already submitted
    async function checkExisting() {
      try {
        const res = await fetch(`/api/feedback?jobId=${jobId}`);
        if (res.ok) {
          const data = await res.json();
          const mine = data.feedbacks?.find(
            (f: { authorId?: string; type?: string }) =>
              f.type === feedbackType
          );
          if (mine) setAlreadySubmitted(true);
        }
      } catch {
        // silently fail
      } finally {
        setChecking(false);
      }
    }
    if (jobId) checkExisting();
  }, [jobId, feedbackType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (overallRating === 0) return;
    setError("");
    setLoading(true);

    try {
      const body: Record<string, unknown> = {
        jobId,
        subjectId,
        type: feedbackType,
        overallRating,
      };
      if (isEmployerToWorker) {
        body.punctuality = punctuality;
        body.attitude = attitude;
        body.workQuality = workQuality;
      } else {
        body.paymentOnTime = paymentOnTime;
        body.fairTreatment = fairTreatment;
      }
      if (comment.trim()) body.comment = comment.trim();

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || commonT("error"));
        return;
      }
      setSubmitted(true);
    } catch {
      setError(commonT("error"));
    } finally {
      setLoading(false);
    }
  }

  // Star selector component
  function StarSelector({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">{label}:</span>
        <div className="flex gap-1" role="group" aria-label={label}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              aria-label={t("starRating", { stars: star })}
              aria-pressed={value === star}
              className={`text-2xl transition ${star <= value ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-500`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Yes/No selector
  function YesNoSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(1)}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition ${
            value === 1
              ? "bg-success text-white shadow-sm"
              : "border border-line bg-white text-ink hover:bg-surface2"
          }`}
        >
          {t("yes")} / ہاں
        </button>
        <button
          type="button"
          onClick={() => onChange(0)}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition ${
            value === 0
              ? "bg-red-600 text-white shadow-sm"
              : "border border-line bg-white text-ink hover:bg-surface2"
          }`}
        >
          {t("no")} / نہیں
        </button>
      </div>
    );
  }

  if (checking) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted">{commonT("loading")}</p>
        </div>
      </>
    );
  }

  if (alreadySubmitted) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="rounded-2xl border border-line bg-surface p-8 shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-successsoft">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-ink">{t("thankYou")}</h2>
            <p className="text-sm text-muted">{t("alreadySubmitted")}</p>
            <button onClick={() => router.back()} className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
              {commonT("back")}
            </button>
          </div>
        </main>
      </>
    );
  }

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="rounded-2xl border border-line bg-surface p-8 shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-successsoft">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-ink">{t("thankYou")}</h2>
            <button onClick={() => router.back()} className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
              {commonT("back")}
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-6 pb-24 sm:pb-8">
        <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-muted hover:text-ink">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          {commonT("back")}
        </button>

        <h1 className="mb-2 text-2xl font-bold text-ink">{t("title")}</h1>
        {subjectName && (
          <p className="mb-6 text-sm text-muted">
            {isEmployerToWorker ? t("rateWorker") : t("rateEmployer")}: <span className="font-semibold">{subjectName}</span>
          </p>
        )}

        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <h3 className="mb-1 text-sm font-semibold text-ink">{t("overallRating")}</h3>
            <p className="mb-1 text-xs text-muted" dir="rtl">مجموعی درجہ بندی</p>
            <div data-testid="overall-stars" className="mt-3 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setOverallRating(star)}
                  aria-label={t("starRating", { stars: star })}
                  aria-pressed={overallRating === star}
                  className={`text-4xl transition ${star <= overallRating ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-500`}>
                  ★
                </button>
              ))}
            </div>
            {overallRating > 0 && (
              <p className="mt-2 text-center text-sm text-muted">
                {overallRating === 5 ? t("excellent") : overallRating === 4 ? t("good") : overallRating === 3 ? t("average") : overallRating === 2 ? t("poor") : t("veryBad")}
                {" "}—{" "}
                {overallRating === 5 ? "عمدہ" : overallRating === 4 ? "اچھا" : overallRating === 3 ? "اوسط" : overallRating === 2 ? "کمزور" : "بہت برا"}
              </p>
            )}
          </div>

          {/* Employer-to-Worker questions */}
          {isEmployerToWorker && (
            <>
              <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                <h3 className="mb-1 text-sm font-semibold text-ink">{t("punctuality")}</h3>
                <p className="mb-3 text-xs text-muted" dir="rtl">{t("punctualityUrdu")}</p>
                <YesNoSelector value={punctuality} onChange={setPunctuality} />
              </div>

              <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                <h3 className="mb-1 text-sm font-semibold text-ink">{t("attitude")}</h3>
                <p className="mb-3 text-xs text-muted" dir="rtl">{t("attitudeUrdu")}</p>
                <StarSelector value={attitude} onChange={setAttitude} label={t("stars")} />
              </div>

              <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                <h3 className="mb-1 text-sm font-semibold text-ink">{t("workQuality")}</h3>
                <p className="mb-3 text-xs text-muted" dir="rtl">{t("workQualityUrdu")}</p>
                <StarSelector value={workQuality} onChange={setWorkQuality} label={t("stars")} />
              </div>
            </>
          )}

          {/* Worker-to-Employer questions */}
          {!isEmployerToWorker && (
            <>
              <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                <h3 className="mb-1 text-sm font-semibold text-ink">{t("paymentOnTime")}</h3>
                <p className="mb-3 text-xs text-muted" dir="rtl">{t("paymentOnTimeUrdu")}</p>
                <YesNoSelector value={paymentOnTime} onChange={setPaymentOnTime} />
              </div>

              <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                <h3 className="mb-1 text-sm font-semibold text-ink">{t("fairTreatment")}</h3>
                <p className="mb-3 text-xs text-muted" dir="rtl">{t("fairTreatmentUrdu")}</p>
                <YesNoSelector value={fairTreatment} onChange={setFairTreatment} />
              </div>
            </>
          )}

          {/* Comment */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <h3 className="mb-1 text-sm font-semibold text-ink">{t("comment")}</h3>
            <p className="mb-3 text-xs text-muted" dir="rtl">{t("commentUrdu")}</p>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500}
              rows={3} placeholder={t("commentPlaceholder")}
              className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
          </div>

          <button type="submit" disabled={loading || overallRating === 0} data-testid="feedback-submit"
            className="w-full rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50">
            {loading ? commonT("loading") : t("submitFeedback")}
          </button>
        </form>
      </main>
    </>
  );
}
