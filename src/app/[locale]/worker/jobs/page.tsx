"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import { WorkerBottomNav } from "@/components/layout/WorkerBottomNav";
import { Badge } from "@/components/ui";
import { ErrorBanner } from "@/components/ui/Feedback";
import { WORKER_CATEGORIES, PAKISTAN_CITIES, SKILLS_MAP, TOOLS, MIN_DAILY_WAGE } from "@/lib/constants";
import { prettyLabel } from "@/lib/labels";

interface BrowseJob {
  id: string;
  title: string;
  description: string | null;
  workerType: string;
  requiredSkills: string[];
  toolsRequired: string[];
  numberOfWorkers: number;
  date: string;
  startTimeHour: number;
  startTimeMinute: number;
  startTimePeriod: string;
  endTimeHour: number;
  endTimeMinute: number;
  endTimePeriod: string;
  wage: number;
  locationName: string | null;
  status: string;
  employer: { id: string; name: string };
  hasOffer: boolean;
  offerStatus: string | null;
  matchingSkills: number;
  totalRequiredSkills: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function WorkerBrowseJobsPage() {
  const t = useTranslations("Jobs");
  const commonT = useTranslations("Common");
  const browseT = useTranslations("BrowseJobs");
  const locale = useLocale() as "en" | "ur";

  const [jobs, setJobs] = useState<BrowseJob[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState(false);

  // Filters
  const [workerType, setWorkerType] = useState("");
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  function getCategoryName(id: string) {
    return WORKER_CATEGORIES.find((c) => c.id === id)?.[locale] || prettyLabel(id);
  }

  function getCityName(id: string | null) {
    if (!id) return "—";
    return PAKISTAN_CITIES.find((c) => c.id === id)?.[locale] || prettyLabel(id);
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

  function formatTime(h: number, m: number, p: string) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${p}`;
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === "ur" ? "ur-PK" : "en-PK", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  async function loadJobs(p: number = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      if (workerType) params.set("workerType", workerType);
      if (city) params.set("city", city);
      if (appliedSearch) params.set("search", appliedSearch);

      const res = await fetch(`/api/worker/jobs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setPagination(data.pagination || null);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs(page);
  }, [page, workerType, city, appliedSearch]);

  function handleSearch() {
    setAppliedSearch(search);
    setPage(1);
  }

  function clearFilters() {
    setWorkerType("");
    setCity("");
    setSearch("");
    setAppliedSearch("");
    setPage(1);
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6 pb-24 sm:pb-8">
        <h1 className="mb-6 text-2xl font-bold text-ink">{browseT("title")}</h1>

        {loadError && (
          <div className="mb-4">
            <ErrorBanner message={commonT("error")} retryLabel={commonT("retry")} onRetry={() => window.location.reload()} />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 space-y-3 rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            {/* Category filter */}
            <select
              value={workerType}
              onChange={(e) => { setWorkerType(e.target.value); setPage(1); }}
              className="rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">{browseT("allCategories")}</option>
              {WORKER_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c[locale]}</option>
              ))}
            </select>

            {/* City filter */}
            <select
              value={city}
              onChange={(e) => { setCity(e.target.value); setPage(1); }}
              className="rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">{browseT("allCities")}</option>
              {PAKISTAN_CITIES.map((c) => (
                <option key={c.id} value={c.id}>{c[locale]}</option>
              ))}
            </select>

            {/* Search */}
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={browseT("searchPlaceholder")}
                className="flex-1 rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSearch}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                {browseT("search")}
              </button>
            </div>
          </div>

          {(workerType || city || appliedSearch) && (
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-primary hover:underline"
            >
              {browseT("clearFilters")}
            </button>
          )}
        </div>

        {/* Results count */}
        {pagination && (
          <p className="mb-4 text-sm text-muted">
            {browseT("showingResults")} {pagination.total} {browseT("jobsFound")}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-12 text-center text-muted">{commonT("loading")}</div>
        )}

        {/* Empty state */}
        {!loading && jobs.length === 0 && (
          <div className="rounded-2xl border border-line bg-surface p-12 text-center shadow-sm">
            <p className="text-lg font-medium text-muted">{browseT("noJobs")}</p>
            <p className="mt-2 text-sm text-muted">{browseT("noJobsDesc")}</p>
          </div>
        )}

        {/* Job cards */}
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-line bg-surface p-5 shadow-sm transition hover:shadow-md"
            >
              {/* Header */}
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{job.title}</h3>
                  <p className="text-sm text-muted">{job.employer.name}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-lg font-bold text-success">
                    PKR {job.wage.toLocaleString()}
                  </span>
                  {job.wage >= MIN_DAILY_WAGE && (<span className="ms-2 rounded-full bg-successsoft px-2 py-0.5 text-[10px] font-bold text-success">✓ Fair</span>)}
                  <span className="text-xs text-muted">{commonT("perDay")}</span>
                </div>
              </div>

              {/* Details */}
              <div className="mb-3 flex flex-wrap gap-2 text-sm text-muted">
                <Badge tone="info">{getCategoryName(job.workerType)}</Badge>
                <Badge tone="default">{getCityName(job.locationName)}</Badge>
                <Badge tone="default">{formatDate(job.date)}</Badge>
                <Badge tone="default">
                  {formatTime(job.startTimeHour, job.startTimeMinute, job.startTimePeriod)} -{" "}
                  {formatTime(job.endTimeHour, job.endTimeMinute, job.endTimePeriod)}
                </Badge>
                <Badge tone="default">{job.numberOfWorkers} {commonT("workers")}</Badge>
              </div>

              {/* Skills */}
              {job.requiredSkills.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1 text-xs font-medium text-muted">{t("requiredSkills")}:</p>
                  <div className="flex flex-wrap gap-1">
                    {job.requiredSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-primarysoft px-2 py-0.5 text-xs font-medium text-primary"
                      >
                        {getSkillName(s)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools */}
              {job.toolsRequired.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1 text-xs font-medium text-muted">{t("toolsRequired")}:</p>
                  <div className="flex flex-wrap gap-1">
                    {job.toolsRequired.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-surface2 px-2 py-0.5 text-xs font-medium text-muted"
                      >
                        {getToolName(t)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {job.description && (
                <p className="mb-3 text-sm text-muted line-clamp-2">{job.description}</p>
              )}

              {/* Match indicator */}
              {job.matchingSkills > 0 && (
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-successsoft0"
                      style={{ width: `${(job.matchingSkills / job.totalRequiredSkills) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-success">
                    {job.matchingSkills}/{job.totalRequiredSkills} {browseT("skillsMatch")}
                  </span>
                </div>
              )}

              {/* Offer status */}
              {job.hasOffer && (
                <div className="mt-3 rounded-lg border border-primary/30 bg-primarysoft p-2 text-center text-sm font-medium text-primary">
                  {job.offerStatus === "PENDING"
                    ? browseT("offerPending")
                    : job.offerStatus === "ACCEPTED"
                    ? browseT("offerAccepted")
                    : browseT("offerDeclined")}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl border border-line px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {commonT("back")}
            </button>
            <span className="text-sm text-muted">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="rounded-xl border border-line px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {commonT("next")}
            </button>
          </div>
        )}
      </main>
      <WorkerBottomNav />
    </>
  );
}