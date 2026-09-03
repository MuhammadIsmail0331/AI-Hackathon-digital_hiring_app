"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/layout/Navbar";
import { EmployerBottomNav } from "@/components/layout/EmployerBottomNav";
import { Badge } from "@/components/ui";
import { WORKER_CATEGORIES } from "@/lib/constants";

interface SessionUser {
  name?: string | null;
  email?: string | null;
}

interface JobItem {
  id: string;
  title: string;
  workerType: string;
  date: string;
  status: string;
  wage: number;
  numberOfWorkers: number;
}

export default function EmployerDashboardPage() {
  const t = useTranslations("Employer");
  const jobsT = useTranslations("Jobs");
  const locale = useLocale() as "en" | "ur";

  const [user, setUser] = useState<SessionUser | null>(null);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sessionRes, jobsRes] = await Promise.all([
          fetch("/api/auth/session"),
          fetch("/api/employer/jobs"),
        ]);
        if (sessionRes.ok) {
          const s = await sessionRes.json();
          setUser(s?.user ?? null);
        }
        if (jobsRes.ok) {
          const data = await jobsRes.json();
          setJobs(data.jobs || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function getCategoryName(id: string) {
    return WORKER_CATEGORIES.find((c) => c.id === id)?.[locale] || id;
  }

  function getStatusBadge(status: string) {
    const map: Record<string, { tone: "success" | "warning" | "danger" | "info" | "default" | "purple"; label: string }> = {
      OPEN: { tone: "info", label: jobsT("statusOpen") },
      DRAFT: { tone: "default", label: jobsT("statusDraft") },
      MATCHING: { tone: "purple", label: jobsT("statusMatching") },
      OFFERS_SENT: { tone: "warning", label: jobsT("statusOffersSent") },
      IN_PROGRESS: { tone: "warning", label: jobsT("statusInProgress") },
      COMPLETED: { tone: "success", label: jobsT("statusCompleted") },
      CANCELLED: { tone: "danger", label: jobsT("statusCancelled") },
    };
    return map[status] || { tone: "default" as const, label: status };
  }

  const activeJobs = jobs.filter((j) =>
    ["OPEN", "OFFERS_SENT", "IN_PROGRESS", "MATCHING"].includes(j.status)
  ).length;
  const completedJobs = jobs.filter((j) => j.status === "COMPLETED").length;
  const recentJobs = jobs.slice(0, 5);

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
            <span className="text-base">{t("welcome")}...</span>
          </div>
        </div>
        <EmployerBottomNav />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-8">
        {/* Welcome Banner */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg shadow-blue-200">
          <h1 className="text-2xl font-bold">
            {t("welcome")}, {user?.name || ""}!
          </h1>
          <p className="mt-1 text-sm text-blue-100">{t("employerDashboard")}</p>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-line bg-surface p-4 text-center shadow-sm">
            <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <div className="text-2xl font-bold text-ink">{activeJobs}</div>
            <div className="mt-0.5 text-xs text-muted">{t("activeJobs")}</div>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4 text-center shadow-sm">
            <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-surface2 text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div className="text-2xl font-bold text-ink">{jobs.length}</div>
            <div className="mt-0.5 text-xs text-muted">{t("totalJobs")}</div>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4 text-center shadow-sm">
            <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-successsoft text-success">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div className="text-2xl font-bold text-ink">{completedJobs}</div>
            <div className="mt-0.5 text-xs text-muted">{t("completedJobs")}</div>
          </div>
        </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link href="/employer/find" className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-3.5 text-base font-semibold text-ink shadow-sm transition hover:bg-surface2">
              🔎 {locale === "ur" ? "پیشہ ور تلاش کریں" : "Find Professionals"}
            </Link>
            <Link
              href="/employer/jobs/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primarystrong px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:shadow-xl hover:shadow-blue-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          {t("createNewJob")}
        </Link>
          </div>

        {recentJobs.length > 0 ? (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">{t("recentJobs")}</h2>
              <Link href="/employer/jobs" className="text-sm font-medium text-primary hover:text-primary">
                {t("allJobs")} →
              </Link>
            </div>
            <div className="space-y-3">
              {recentJobs.map((job) => {
                const badge = getStatusBadge(job.status);
                return (
                  <Link
                    key={job.id}
                    href={`/employer/jobs/${job.id}`}
                    className="block rounded-2xl border border-line bg-surface p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-ink">{job.title}</h3>
                        <p className="mt-0.5 text-sm text-muted">
                          {getCategoryName(job.workerType)} · {job.numberOfWorkers} {jobsT("professionals")}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {new Date(job.date).toLocaleDateString(locale === "ur" ? "ur-PK" : "en-PK", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge tone={badge.tone}>{badge.label}</Badge>
                        <span className="text-sm font-semibold text-ink">
                          {job.wage.toLocaleString()} PKR
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primarysoft p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-ink">{jobsT("noJobs")}</h2>
            <p className="mb-6 text-sm text-muted">{jobsT("noJobsDesc")}</p>
            <Link
              href="/employer/jobs/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primarystrong px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:shadow-xl hover:shadow-blue-300"
            >
              {jobsT("createFirstJob")}
            </Link>
          </div>
        )}
      </main>
      <EmployerBottomNav />
    </>
  );
}