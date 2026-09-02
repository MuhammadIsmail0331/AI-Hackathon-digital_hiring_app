"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/layout/Navbar";
import { EmployerBottomNav } from "@/components/layout/EmployerBottomNav";
import { Badge } from "@/components/ui";
import { WORKER_CATEGORIES } from "@/lib/constants";

interface JobItem {
  id: string;
  title: string;
  workerType: string;
  date: string;
  status: string;
  wage: number;
  numberOfWorkers: number;
  offerCounts?: {
    total: number;
    pending: number;
    accepted: number;
    declined: number;
  };
}

export default function EmployerJobsPage() {
  const t = useTranslations("Jobs");
  const locale = useLocale() as "en" | "ur";

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await fetch("/api/employer/jobs");
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs || []);
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
    return WORKER_CATEGORIES.find((c) => c.id === id)?.[locale] || id;
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

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t("myJobs")}</h1>
          <Link
            href="/employer/jobs/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            {t("createJob")}
          </Link>
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="flex items-center gap-3 text-gray-500">
              <svg className="h-6 w-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{t("searching")}...</span>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">{t("noJobs")}</h2>
            <p className="mb-6 text-sm text-gray-500">{t("noJobsDesc")}</p>
            <Link
              href="/employer/jobs/new"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              {t("createFirstJob")}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              const badge = getStatusBadge(job.status);
              const accepted = job.offerCounts?.accepted ?? 0;
              return (
                <Link
                  key={job.id}
                  href={`/employer/jobs/${job.id}`}
                  className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {getCategoryName(job.workerType)} · {job.numberOfWorkers} {t("professionals")}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(job.date).toLocaleDateString(locale === "ur" ? "ur-PK" : "en-PK", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge tone={badge.tone}>{badge.label}</Badge>
                      <span className="text-sm font-semibold text-gray-900">
                        {job.wage.toLocaleString()} PKR
                      </span>
                      {job.offerCounts && (
                        <span className="text-xs text-gray-500">
                          {accepted}/{job.numberOfWorkers} {t("professionals")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <EmployerBottomNav />
    </>
  );
}
