"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import AuthPageWrapper from "@/components/layout/AuthPageWrapper";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const common = useTranslations("Common");
  const pwT = useTranslations("Password");
  const resetT = useTranslations("PasswordReset");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("invalidCredentials"));
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError(common("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageWrapper>
      <div className="overflow-hidden rounded-3xl border border-line bg-surface/90 shadow-xl shadow-gray-200/40 backdrop-blur-sm">
        {/* Header accent */}
        <div className="bg-gradient-to-r from-primary to-primarystrong px-8 py-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">
            {t("loginTitle")}
          </h1>
        </div>

        <div className="p-8">
          {error && (
            <div role="alert" className="mb-4 rounded-xl border border-danger/30 bg-dangersoft p-3 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-line bg-surface2/50 px-4 py-3 text-base outline-none transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primarysoft"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                {t("password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-line bg-surface2/50 px-4 py-3 pe-12 text-base outline-none transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primarysoft"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted transition hover:bg-surface2 hover:text-ink"
                  aria-label={showPassword ? pwT("hidePassword") : pwT("showPassword")}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div />
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-sm font-medium text-primary transition hover:text-primarystrong hover:underline"
              >
                {resetT("forgotPassword")}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-primarystrong px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primarystrong disabled:opacity-50"
            >
              {loading ? common("loading") : t("loginTitle")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              {t("noAccount")}{" "}
              <button
                onClick={() => router.push("/register")}
                className="font-semibold text-primary transition hover:text-primarystrong hover:underline"
              >
                {t("registerHere")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </AuthPageWrapper>
  );
}
