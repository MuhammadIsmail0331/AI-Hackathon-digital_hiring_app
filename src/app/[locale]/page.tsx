import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import Navbar from "@/components/layout/Navbar";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function LandingPage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("Landing");
  const app = useTranslations("App");

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 py-16 text-center sm:px-12 sm:py-24">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -end-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -start-16 h-48 w-48 rounded-full bg-emerald-400/15 blur-2xl" />
          <div className="pointer-events-none absolute end-1/4 top-1/3 h-32 w-32 rounded-full bg-purple-400/10 blur-xl" />

          <div className="relative z-10">
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
              {t("title")}
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-base text-blue-100 sm:text-lg">
              {t("description")}
            </p>

            {/* CTA Cards inside hero */}
            <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
              {/* Employer CTA */}
              <div className="group rounded-2xl border border-white/20 bg-white/10 p-6 text-start backdrop-blur-sm transition hover:border-white/40 hover:bg-white/20">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </div>
                <h2 className="mb-1 text-lg font-semibold text-white">{t("needWorker")}</h2>
                <p className="mb-4 text-sm text-blue-100">{t("needWorkerDesc")}</p>
                <Link
                  href="/register"
                  className="block w-full rounded-xl bg-white px-5 py-2.5 text-center text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 active:bg-blue-100"
                >
                  {t("needWorker")}
                </Link>
              </div>

              {/* Worker CTA */}
              <div className="group rounded-2xl border border-white/20 bg-white/10 p-6 text-start backdrop-blur-sm transition hover:border-white/40 hover:bg-white/20">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h2 className="mb-1 text-lg font-semibold text-white">{t("amWorker")}</h2>
                <p className="mb-4 text-sm text-blue-100">{t("amWorkerDesc")}</p>
                <Link
                  href="/register"
                  className="block w-full rounded-xl bg-emerald-500 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-400 active:bg-emerald-600"
                >
                  {t("amWorker")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature highlights */}
        <section className="py-14">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Verified & Secure</h3>
              <p className="mt-1 text-xs text-gray-500">Phone-verified accounts with secure authentication</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Smart Matching</h3>
              <p className="mt-1 text-xs text-gray-500">AI-powered worker-job matching within 50km radius</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Easy Scheduling</h3>
              <p className="mt-1 text-xs text-gray-500">Set dates, times, and wages — find workers fast</p>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <footer className="mb-6 text-center text-sm text-gray-500">
          <p>{app("tagline")}</p>
          <p className="mt-1">Pakistan</p>
        </footer>
      </main>
    </>
  );
}
