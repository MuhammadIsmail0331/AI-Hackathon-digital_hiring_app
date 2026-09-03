import { use } from "react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/layout/Navbar";
import { BrandAccent, StatCard } from "@/components/ui";
import { db } from "@/lib/db";

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [completedJobs, workers, profileAgg] = await Promise.all([
      db.job.count({ where: { status: "COMPLETED" } }),
      db.user.count({ where: { role: "WORKER" } }),
      db.workerProfile.aggregate({ _avg: { avgRating: true } }),
    ]);
    return {
      jobs: completedJobs.toLocaleString("en-PK"),
      workers: workers.toLocaleString("en-PK"),
      rating: profileAgg._avg.avgRating
        ? profileAgg._avg.avgRating.toFixed(1)
        : "—",
    };
  } catch {
    return { jobs: "—", workers: "—", rating: "—" };
  }
}

export default function LandingPage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("Landing");
  const stats = use(getStats());

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-[#0a5c48] via-[#0d7a5f] to-[#123f33] px-6 pb-16 pt-14 text-center sm:px-12 sm:pb-20 sm:pt-16">
          {/* Decorative layer */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -end-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -start-16 h-56 w-56 rounded-full bg-amber-400/20 blur-2xl" />
            <div className="absolute end-1/4 top-1/3 h-40 w-40 rounded-full bg-orange-400/10 blur-xl" />
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 30px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 30px)",
              }}
            />
            <span
              aria-hidden="true"
              dir="rtl"
              className="pointer-events-none absolute -bottom-6 start-4 select-none text-[7rem] font-bold leading-none text-white/5 sm:text-[10rem]"
              style={{ fontFamily: "var(--font-nastaliq), serif" }}
            >
              روزگار
            </span>
          </div>

          <div className="relative z-10 mx-auto max-w-3xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold text-emerald-50 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              Made for Pakistan · <span dir="rtl">روزگار</span>
            </span>

            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mx-auto mb-9 max-w-2xl text-base leading-relaxed text-emerald-50/90 sm:text-lg">
              {t("description")}
            </p>

            {/* Role cards */}
            <div className="mx-auto grid max-w-2xl gap-4 text-start sm:grid-cols-2 stagger">
              <Link
                href="/register"
                className="group rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm transition hover:border-amber-300/50 hover:bg-white/15"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </div>
                <h2 className="mb-1 text-lg font-bold text-white">{t("needWorker")}</h2>
                <p className="mb-4 text-sm leading-relaxed text-emerald-50/85">{t("needWorkerDesc")}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300 transition group-hover:gap-2.5">
                  {t("needWorker")}
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </Link>

              <Link
                href="/register"
                className="group rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm transition hover:border-emerald-300/50 hover:bg-white/15"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h2 className="mb-1 text-lg font-bold text-white">{t("amWorker")}</h2>
                <p className="mb-4 text-sm leading-relaxed text-emerald-50/85">{t("amWorkerDesc")}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300 transition group-hover:gap-2.5">
                  {t("amWorker")}
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* Trust chips */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
              {[
                { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />, label: t("chipVerified") },
                { icon: <rect x="4" y="7" width="16" height="13" rx="2" />, label: t("chipEscrow") },
                { icon: <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />, label: t("chipRated") },
              ].map((chip, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-emerald-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {chip.icon}
                  </svg>
                  {chip.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <BrandAccent />

        {/* ── Live stats ── */}
        <section className="mx-auto -mt-7 max-w-3xl px-4">
          <div className="grid gap-4 sm:grid-cols-3 stagger">
            <StatCard
              label={t("statsJobs")}
              value={stats.jobs}
              tone="primary"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="7" rx="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              }
            />
            <StatCard
              label={t("statsWorkers")}
              value={stats.workers}
              tone="accent"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            />
            <StatCard
              label={t("statsRating")}
              value={stats.rating}
              tone="terracotta"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              }
            />
          </div>
        </section>

        {/* ── Why Rozgaar ── */}
        <section className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="mb-2 text-center text-2xl font-bold text-ink sm:text-3xl">
            {t("trustTitle")}
          </h2>
          <div className="mx-auto mb-10 h-1 w-16 rounded-full bg-gradient-to-r from-primary via-accent to-terracotta" />
          <div className="grid gap-5 sm:grid-cols-3 stagger">
            {[
              {
                title: t("featureVerifiedTitle"),
                desc: t("featureVerifiedDesc"),
                tile: "bg-primarysoft text-primary",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                ),
              },
              {
                title: t("featureMatchingTitle"),
                desc: t("featureMatchingDesc"),
                tile: "bg-accentsoft text-accent",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                  </svg>
                ),
              },
              {
                title: t("featurePaymentTitle"),
                desc: t("featurePaymentDesc"),
                tile: "bg-terracottasoft text-terracotta",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                ),
              },
            ].map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${f.tile}`}>
                  {f.icon}
                </div>
                <h3 className="mb-1.5 text-base font-bold text-ink">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
