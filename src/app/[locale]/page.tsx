import { use } from "react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/layout/Navbar";
import { BrandAccent } from "@/components/ui";
import { SkylineScene } from "@/components/illustrations/SkylineScene";
import { WorkCrew } from "@/components/illustrations/characters";
import { CountUp, Marquee, Reveal, TiltCard } from "@/components/motion";
import { WORKER_CATEGORIES } from "@/lib/constants";
import { db } from "@/lib/db";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [completedJobs, workers, profileAgg, reviews] = await Promise.all([
      db.job.count({ where: { status: "COMPLETED" } }),
      db.user.count({ where: { role: "WORKER" } }),
      db.workerProfile.aggregate({ _avg: { avgRating: true } }),
      db.feedback.count(),
    ]);
    return {
      jobs: completedJobs,
      workers,
      rating: profileAgg._avg.avgRating ?? 0,
      reviews: reviews,
    };
  } catch {
    return { jobs: 0, workers: 0, rating: 0, reviews: 0 };
  }
}

export default function LandingPage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const loc = locale as "en" | "ur";
  const t = useTranslations("Landing");
  const app = useTranslations("App");
  const stats = use(getStats());

  return (
    <>
      <Navbar />
      <main>
        {/* ─── Hero: sky, skyline scene, floating tools, roles ─── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0e7a5c] via-[#0a6350] to-[#0a4a3a] px-6 pb-40 pt-16 text-center sm:pt-20">
          {/* glow orbs */}
          <div className="pointer-events-none absolute -end-24 -top-24 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -start-24 top-40 h-72 w-72 rounded-full bg-emerald-300/15 blur-3xl" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.10]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.7) 0 1px, transparent 1px 34px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.7) 0 1px, transparent 1px 34px)",
            }}
          />

          {/* Sparkles */}
          <span aria-hidden="true" className="animate-pulse absolute start-[30%] top-16 hidden text-lg text-amber-200/90 md:block">✦</span>
          <span aria-hidden="true" className="animate-pulse absolute end-[26%] top-24 hidden text-sm text-emerald-200/80 md:block" style={{ animationDelay: "0.7s" }}>✦</span>
          <span aria-hidden="true" className="animate-pulse absolute start-[22%] top-44 hidden text-xs text-white/70 md:block" style={{ animationDelay: "1.4s" }}>✦</span>
          <span aria-hidden="true" className="animate-pulse absolute end-[30%] top-52 hidden text-base text-amber-200/70 md:block" style={{ animationDelay: "2s" }}>✦</span>
          {/* floating tool chips */}
          <div
            aria-hidden="true"
            className="animate-float absolute start-[8%] top-24 hidden rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-amber-200 backdrop-blur-sm md:block"
          >
            🔨 Hammer
          </div>
          <div
            aria-hidden="true"
            className="animate-float absolute end-[10%] top-32 hidden rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-200 backdrop-blur-sm md:block"
            style={{ animationDelay: "1.2s" }}
          >
            🔧 Wrench
          </div>
          <div
            aria-hidden="true"
            className="animate-float absolute start-[16%] top-56 hidden rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-orange-200 backdrop-blur-sm md:block"
            style={{ animationDelay: "2.1s" }}
          >
            🪜 Ladder
          </div>

          <div className="relative z-10 mx-auto max-w-3xl">
            <Reveal>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold text-emerald-50 backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />
                Digital Hiring · <span dir="rtl">روزگار</span> · Made for Pakistan
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
                {t("title")}
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mb-9 max-w-2xl text-base leading-relaxed text-emerald-50/90 sm:text-lg">
                {t("description")}
              </p>
            </Reveal>

            {/* Role cards */}
            <Reveal delay={0.24}>
              <div className="mx-auto grid max-w-2xl gap-4 text-start sm:grid-cols-2">
                <TiltCard className="h-full">
                  <Link
                    href="/register?role=EMPLOYER"
                    className="group flex h-full flex-col rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-md transition hover:border-amber-300/50"
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
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-emerald-50/85">{t("needWorkerDesc")}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300 transition-all group-hover:gap-2.5">
                      {t("needWorker")}
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </span>
                  </Link>
                </TiltCard>
                <TiltCard className="h-full">
                  <Link
                    href="/register?role=WORKER"
                    className="group flex h-full flex-col rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-md transition hover:border-emerald-300/50"
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <h2 className="mb-1 text-lg font-bold text-white">{t("amWorker")}</h2>
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-emerald-50/85">{t("amWorkerDesc")}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300 transition-all group-hover:gap-2.5">
                      {t("amWorker")}
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </span>
                  </Link>
                </TiltCard>
              </div>
            </Reveal>
          </div>

          {/* Animated skyline */}
          <SkylineScene className="-mb-px" />
        </section>

        <BrandAccent />

        {/* ─── Category marquee ─── */}
        <div className="border-b border-line bg-surface py-3">
          <Marquee>
            {WORKER_CATEGORIES.map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center gap-2 rounded-full bg-surface2 px-4 py-1.5 text-sm font-semibold text-muted"
              >
                <span className="h-2 w-2 rounded-full bg-primary" />
                {cat[loc]}
              </span>
            ))}
          </Marquee>
        </div>

        {/* ─── Live stats ─── */}
        <section className="mx-auto max-w-4xl px-4 py-14">
          <div className="grid gap-4 sm:grid-cols-3">
            <Reveal>
              <div className="rounded-2xl border border-line bg-surface p-6 text-center shadow-sm">
                <div className="text-4xl font-extrabold text-primary">
                  <CountUp to={stats.jobs} />
                </div>
                <div className="mt-1 text-sm font-medium text-muted">{t("statsJobs")}</div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-line bg-surface p-6 text-center shadow-sm">
                <div className="text-4xl font-extrabold text-accent">
                  <CountUp to={stats.workers} />
                </div>
                <div className="mt-1 text-sm font-medium text-muted">{t("statsWorkers")}</div>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="rounded-2xl border border-line bg-surface p-6 text-center shadow-sm">
                <div className="text-4xl font-extrabold text-terracotta">
                  <CountUp to={stats.rating} decimals={1} suffix=" ★" />
                </div>
                <div className="mt-1 text-sm font-medium text-muted">{t("statsRating")}</div>
                <div className="text-[11px] text-muted/70">{t("statsReviews", { count: stats.reviews })}</div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── Why Rozgaar + character ─── */}
        <section className="mx-auto max-w-5xl px-4 pb-20">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              <Reveal>
                <h2 className="mb-2 text-2xl font-bold text-ink sm:text-3xl">{t("trustTitle")}</h2>
                <div className="mb-8 h-1 w-16 rounded-full bg-gradient-to-r from-primary via-accent to-terracotta" />
              </Reveal>
              <div className="space-y-4">
                {[
                  { title: t("featureVerifiedTitle"), desc: t("featureVerifiedDesc"), tile: "bg-primarysoft text-primary", icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></> },
                  { title: t("featureMatchingTitle"), desc: t("featureMatchingDesc"), tile: "bg-accentsoft text-accent", icon: <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /> },
                  { title: t("featurePaymentTitle"), desc: t("featurePaymentDesc"), tile: "bg-terracottasoft text-terracotta", icon: <><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></> },
                ].map((f, i) => (
                  <Reveal key={i} delay={i * 0.1}>
                    <div className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${f.tile}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
                      </div>
                      <div>
                        <h3 className="mb-1 text-base font-bold text-ink">{f.title}</h3>
                        <p className="text-sm leading-relaxed text-muted">{f.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
            <Reveal delay={0.2} className="hidden lg:block">
              <div className="relative rounded-3xl border border-line bg-gradient-to-b from-primarysoft to-surface p-8 text-center shadow-lg">
                <WorkCrew className="mx-auto w-full max-w-[280px]" />
                <p className="mt-2 text-sm font-semibold text-muted" dir="rtl" style={{ fontFamily: "var(--font-nastaliq), serif" }}>
                  روزگار — ہنر کی قدر
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── CTA band ─── */}
        <section className="px-4 pb-16">
          <Reveal>
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primarystrong px-8 py-12 text-center shadow-xl">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.12]"
                style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 26px)" }}
              />
              <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">{app("tagline")}</h2>
              <p className="mx-auto mb-6 max-w-xl text-sm text-emerald-50/90 sm:text-base">{t("description")}</p>
              <Link
                href="/register?role=EMPLOYER"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-bold text-primary shadow-lg transition hover:gap-3 hover:shadow-xl"
              >
                {t("needWorker")}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
    </>
  );
}