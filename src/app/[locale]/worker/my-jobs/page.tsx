"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import { WorkerBottomNav } from "@/components/layout/WorkerBottomNav";
import { Badge } from "@/components/ui";
import { useRouter } from "@/i18n/navigation";
import { WORKER_CATEGORIES, PAKISTAN_CITIES } from "@/lib/constants";
import { prettyLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";

interface JobCardData {
  offerId: string;
  jobId: string;
  title: string;
  workerType: string;
  date: string;
  startTimeHour: number;
  startTimeMinute: number;
  startTimePeriod: string;
  endTimeHour: number;
  endTimeMinute: number;
  endTimePeriod: string;
  wage: number;
  locationName: string | null;
  jobStatus: string;
  numberOfWorkers: number;
  employerName: string;
  employerPhone: string;
  payment: { status: string; totalAmount: number } | null;
}

export default function WorkerMyJobsPage() {
  const t = useTranslations("MyJobs");
  const jobsT = useTranslations("Jobs");
  const dashboardT = useTranslations("Dashboard");
  const paymentT = useTranslations("Payment");
  const common = useTranslations("Common");
  const locale = useLocale() as "en" | "ur";
  const router = useRouter();

  const [active, setActive] = useState<JobCardData[]>([]);
  const [completed, setCompleted] = useState<JobCardData[]>([]);
  const [stats, setStats] = useState({ activeJobs: 0, completedJobs: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "completed">("active");

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await fetch("/api/worker/my-jobs");
        if (res.ok) {
          const data = await res.json();
          setActive(data.active || []);
          setCompleted(data.completed || []);
          if (data.stats) setStats(data.stats);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
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

  function paymentBadge(status: string) {
    switch (status) {
      case "SECURED":
        return { tone: "info" as const, label: paymentT("secured") };
      case "HELD":
        return { tone: "warning" as const, label: paymentT("held") };
      case "RELEASED":
        return { tone: "success" as const, label: paymentT("released") };
      case "CANCELLED":
        return { tone: "default" as const, label: paymentT("refunded") };
      default:
        return { tone: "default" as const, label: paymentT("notSecured") };
    }
  }

  function jobStatusBadge(status: string) {
    switch (status) {
      case "OFFERS_SENT":
        return { tone: "warning" as const, label: jobsT("statusOffersSent") };
      case "IN_PROGRESS":
        return { tone: "warning" as const, label: jobsT("statusInProgress") };
      case "COMPLETED":
        return { tone: "success" as const, label: jobsT("statusCompleted") };
      default:
        return { tone: "default" as const, label: status };
    }
  }

  function renderJobCard(job: JobCardData) {
    const status = jobStatusBadge(job.jobStatus);
    const payment = job.payment ? paymentBadge(job.payment.status) : null;

    return (
      <div
        key={job.jobId}
        className="rounded-2xl border border-line bg-surface p-5 shadow-sm transition hover:shadow-md"
      >
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-ink">{job.title}</h3>
            <p className="text-sm text-muted">
              {t("employer")}: {job.employerName}
            </p>
          </div>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>

        {/* Details */}
        <div className="mb-3 space-y-2 text-sm text-muted">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{getCategoryName(job.workerType)}</span>
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

        {/* Payment status */}
        {payment && (
          <div className="mb-3 flex items-center justify-between rounded-lg bg-surface2 p-3">
            <span className="text-xs font-medium text-muted">{t("payment")}</span>
            <Badge tone={payment.tone}>{payment.label}</Badge>
          </div>
        )}

        {/* View details */}
        <button
          onClick={() => router.push(`/worker/my-jobs/${job.jobId}`)}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {t("viewDetails")}
        </button>
      </div>
    );
  }

  const jobs = tab === "active" ? active : completed;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-8">
        {/* Header Banner */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg shadow-blue-200">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-sm text-blue-100">
            {dashboardT("activeJobs")}: {stats.activeJobs} · {dashboardT("completedJobs")}: {stats.completedJobs}
          </p>
        </div>

        {/* Tabs */}
        <div role="group" aria-label={t("title")} className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-surface2 p-1.5">
          <button
            onClick={() => setTab("active")}
            aria-pressed={tab === "active"}
            className={cn(
              "rounded-xl py-2.5 text-sm font-semibold transition",
              tab === "active"
                ? "bg-white text-primary shadow-sm"
                : "text-muted hover:text-ink"
            )}
          >
            {t("activeTab")} ({active.length})
          </button>
          <button
            onClick={() => setTab("completed")}
            aria-pressed={tab === "completed"}
            className={cn(
              "rounded-xl py-2.5 text-sm font-semibold transition",
              tab === "completed"
                ? "bg-white text-primary shadow-sm"
                : "text-muted hover:text-ink"
            )}
          >
            {t("completedTab")} ({completed.length})
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="flex items-center gap-3 text-muted">
              <svg className="h-6 w-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{common("loading")}</span>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primarysoft p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-ink">
              {tab === "active" ? t("noActive") : t("noCompleted")}
            </h2>
            <p className="text-sm text-muted">
              {tab === "active" ? t("noActiveDesc") : t("noCompletedDesc")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(renderJobCard)}
          </div>
        )}
      </main>
      <WorkerBottomNav />
    </>
  );
}
