"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import { useRouter } from "@/i18n/navigation";

interface ReportItem {
  id: string;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function ReportPage() {
  const t = useTranslations("Report");
  const commonT = useTranslations("Common");
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [reports, setReports] = useState<ReportItem[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const res = await fetch("/api/issues");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch {
      // silently fail
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          description: description.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || commonT("error"));
        return;
      }
      setSubmitted(true);
      setSubject("");
      setDescription("");
      // Reload reports
      loadReports();
    } catch {
      setError(commonT("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-6 pb-24 sm:pb-8">
        <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-muted hover:text-ink">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          {commonT("back")}
        </button>

        <h1 className="mb-6 text-2xl font-bold text-ink">{t("title")}</h1>

        {submitted && (
          <div role="status" className="mb-4 rounded-lg border border-success/30 bg-successsoft p-3 text-sm text-success">
            {t("submitted")}
          </div>
        )}

        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-8 space-y-5">
          <div>
            <label htmlFor="report-subject" className="mb-1.5 block text-sm font-medium text-ink">
              {t("subject")}
            </label>
            <input
              id="report-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              maxLength={200}
              placeholder={t("subjectPlaceholder")}
              className="w-full rounded-xl border border-line px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label htmlFor="report-desc" className="mb-1.5 block text-sm font-medium text-ink">
              {t("description")}
            </label>
            <textarea
              id="report-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={2000}
              rows={5}
              placeholder={t("descriptionPlaceholder")}
              className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !subject.trim() || !description.trim()}
            className="w-full rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? commonT("loading") : t("submit")}
          </button>
        </form>

        {/* My Reports */}
        {reports.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-ink">{t("myReports")}</h2>
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.id} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink">{r.subject}</h3>
                    <span className="rounded-full bg-surface2 px-2 py-0.5 text-xs font-medium text-muted">
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted">{r.description.slice(0, 100)}{r.description.length > 100 ? "..." : ""}</p>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
