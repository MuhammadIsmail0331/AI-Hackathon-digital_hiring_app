"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import Navbar from "@/components/layout/Navbar";
import { WorkerBottomNav } from "@/components/layout/WorkerBottomNav";
import { Badge } from "@/components/ui";
import {
  WORKER_CATEGORIES,
  SKILLS_MAP,
  TOOLS,
  PAKISTAN_CITIES,
} from "@/lib/constants";

interface WorkerJobDetail {
  id: string;
  title: string;
  description: string | null;
  workerType: string;
  requiredSkills: string[];
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
  numberOfWorkers: number;
  acceptedWorkers: number;
  employer: { id: string; name: string; phone: string };
  payment: {
    status: string;
    totalAmount: number;
    securedAt: string | null;
    releasedAt: string | null;
  } | null;
}

export default function WorkerMyJobDetailPage() {
  const t = useTranslations("MyJobs");
  const jobsT = useTranslations("Jobs");
  const paymentT = useTranslations("Payment");
  const feedbackT = useTranslations("Feedback");
  const notificationsT = useTranslations("Notifications");
  const common = useTranslations("Common");
  const locale = useLocale() as "en" | "ur";
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<WorkerJobDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJob() {
      try {
        const res = await fetch(`/api/worker/my-jobs/${jobId}`);
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
    return WORKER_CATEGORIES.find((c) => c.id === id)?.[locale] || id;
  }

  function getSkillName(id: string) {
    for (const skills of Object.values(SKILLS_MAP)) {
      const found = skills.find((s) => s.id === id);
      if (found) return found[locale];
    }
    return id;
  }

  function getToolName(id: string) {
    return TOOLS.find((t) => t.id === id)?.[locale] || id;
  }

  function getCityName(id: string | null) {
    if (!id) return "—";
    return PAKISTAN_CITIES.find((c) => c.id === id)?.[locale] || id;
  }

  function formatTime(h: number, m: number, p: string) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${p}`;
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <svg className="h-6 w-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>{common("loading")}</span>
          </div>
        </div>
        <WorkerBottomNav />
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-gray-500">
          <p>{common("error")}</p>
          <button
            onClick={() => router.push("/worker/my-jobs")}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {t("backToMyJobs")}
          </button>
        </div>
        <WorkerBottomNav />
      </>
    );
  }

  const status = jobStatusBadge(job.status);
  const payment = job.payment ? paymentBadge(job.payment.status) : null;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-8">
        {/* Back link */}
        <button
          onClick={() => router.push("/worker/my-jobs")}
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          {t("backToMyJobs")}
        </button>

        {/* Title + Status */}
        <div className="mb-4 flex items-start justify-between gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>

        {/* Employer contact card */}
        <div className="mb-6 rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-green-600">{t("employer")}</div>
                <div className="font-semibold text-gray-900">{job.employer.name}</div>
                <div className="text-sm text-green-700">{job.employer.phone}</div>
              </div>
            </div>
            <a
              href={`tel:${job.employer.phone}`}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{notificationsT("callNow")}</span>
            </a>
          </div>
        </div>

        {/* Payment status card */}
        {job.payment && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
                {t("payment")}
              </h2>
              <Badge tone={payment!.tone}>{payment!.label}</Badge>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs text-gray-500">{paymentT("total")}</div>
              <div className="mt-0.5 text-lg font-bold text-gray-900">
                {job.payment.totalAmount.toLocaleString()} PKR
              </div>
              {job.payment.securedAt && (
                <div className="mt-1 text-xs text-gray-500">
                  {paymentT("securedAt")}:{" "}
                  {new Date(job.payment.securedAt).toLocaleDateString(
                    locale === "ur" ? "ur-PK" : "en-PK",
                    { year: "numeric", month: "short", day: "numeric" }
                  )}
                </div>
              )}
              {job.payment.releasedAt && (
                <div className="mt-1 text-xs text-gray-500">
                  {paymentT("releasedAt")}:{" "}
                  {new Date(job.payment.releasedAt).toLocaleDateString(
                    locale === "ur" ? "ur-PK" : "en-PK",
                    { year: "numeric", month: "short", day: "numeric" }
                  )}
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">{paymentT("simulatedNote")}</p>
          </div>
        )}

        {/* Job details card */}
        <div className="mb-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {jobsT("professionalType")}
            </div>
            <div className="mt-1 font-semibold text-gray-900">
              {getCategoryName(job.workerType)}
            </div>
          </div>

          {job.requiredSkills.length > 0 && (
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {jobsT("requiredSkills")}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {job.requiredSkills.map((sId) => (
                  <span key={sId} className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    {getSkillName(sId)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs text-gray-500">{jobsT("jobDate")}</div>
              <div className="mt-0.5 text-sm font-semibold text-gray-900">
                {new Date(job.date).toLocaleDateString(locale === "ur" ? "ur-PK" : "en-PK", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs text-gray-500">{jobsT("peopleNeeded")}</div>
              <div className="mt-0.5 text-sm font-semibold text-gray-900">
                {job.acceptedWorkers}/{job.numberOfWorkers}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs text-gray-500">{jobsT("startTime")}</div>
              <div className="mt-0.5 text-sm font-semibold text-gray-900">
                {formatTime(job.startTimeHour, job.startTimeMinute, job.startTimePeriod)}
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs text-gray-500">{jobsT("endTime")}</div>
              <div className="mt-0.5 text-sm font-semibold text-gray-900">
                {formatTime(job.endTimeHour, job.endTimeMinute, job.endTimePeriod)}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-blue-50 p-3">
            <div className="text-xs text-blue-600">{jobsT("wagePerPerson")}</div>
            <div className="mt-0.5 text-lg font-bold text-blue-800">
              {job.wage.toLocaleString()} PKR
            </div>
          </div>

          {job.toolsRequired.length > 0 && (
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {jobsT("toolsProvided")}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {job.toolsRequired.map((tId) => (
                  <span key={tId} className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {getToolName(tId)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.locationName && (
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {jobsT("jobLocation")}
              </div>
              <div className="mt-1 font-semibold text-gray-900">
                {getCityName(job.locationName)}
              </div>
            </div>
          )}

          {job.description && (
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {jobsT("additionalDetails")}
              </div>
              <p className="mt-1 text-sm text-gray-700">{job.description}</p>
            </div>
          )}
        </div>

        {/* Feedback link for completed jobs */}
        {job.status === "COMPLETED" && (
          <button
            onClick={() =>
              router.push(
                `/feedback/${job.id}?subjectId=${job.employer.id}&type=WORKER_TO_EMPLOYER&name=${encodeURIComponent(job.employer.name)}`
              )
            }
            className="w-full rounded-xl border border-blue-200 bg-blue-50 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            {feedbackT("rateEmployer")}: {job.employer.name}
          </button>
        )}
      </main>
      <WorkerBottomNav />
    </>
  );
}
