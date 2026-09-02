"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import AuthPageWrapper from "@/components/layout/AuthPageWrapper";

export default function ForgotPasswordPage() {
  const t = useTranslations("PasswordReset");
  const common = useTranslations("Common");
  const pwT = useTranslations("Password");
  const otpT = useTranslations("OTP");
  const authT = useTranslations("Auth");
  const router = useRouter();

  const [step, setStep] = useState<"phone" | "otp" | "newPassword" | "success">("phone");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Password strength
  const pwErrors: string[] = [];
  if (newPassword.length > 0) {
    if (newPassword.length < 8) pwErrors.push(pwT("minLength"));
    if (!/[A-Z]/.test(newPassword)) pwErrors.push(pwT("uppercase"));
    if (!/[a-z]/.test(newPassword)) pwErrors.push(pwT("lowercase"));
    if (!/[0-9]/.test(newPassword)) pwErrors.push(pwT("number"));
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)) pwErrors.push(pwT("special"));
  }

  async function handleSendOTP() {
    if (!phone) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || common("error"));
        return;
      }
      // If no otpId was returned (production or unregistered phone),
      // still proceed to OTP step — the generic message is shown
      setDevCode(data.code || "");
      setStep("otp");
      setCooldown(60);
      // Start cooldown timer
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError(common("error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    setError("");

    if (newPassword !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    if (pwErrors.length > 0) {
      setError(pwErrors[0]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otpCode, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || common("error"));
        return;
      }
      setStep("success");
    } catch {
      setError(common("error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetWithoutOTP() {
    setError("");

    if (newPassword !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    if (pwErrors.length > 0) {
      setError(pwErrors[0]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || common("error"));
        return;
      }
      setStep("success");
    } catch {
      setError(common("error"));
    } finally {
      setLoading(false);
    }
  }

  function EyeIcon({ open }: { open: boolean }) {
    return open ? (
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
    );
  }

  return (
    <AuthPageWrapper>
    <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl shadow-gray-200/40 backdrop-blur-sm">
      {/* Gradient header changes per step */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-center">
        {step === "phone" && (
          <>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">{t("forgotTitle")}</h1>
            <p className="mt-1 text-sm text-blue-100">{t("forgotDescription")}</p>
          </>
        )}
        {step === "otp" && (
          <>
            <h1 className="text-xl font-bold text-white">{t("resetTitle")}</h1>
            <p className="mt-1 text-sm text-blue-100">{t("resetDescription")}</p>
          </>
        )}
        {step === "newPassword" && (
          <>
            <h1 className="text-xl font-bold text-white">{t("resetTitle")}</h1>
            <p className="mt-1 text-sm text-blue-100">{t("resetDescription")}</p>
          </>
        )}
        {step === "success" && (
          <>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">{common("success")}</h1>
            <p className="mt-1 text-sm text-blue-100">{t("resetSuccess")}</p>
          </>
        )}
      </div>

      <div className="p-8">
        {/* Step: Phone */}
        {step === "phone" && (
          <>
            {error && (
              <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }}
              className="space-y-5"
            >
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700">
                  {authT("phone")}
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  autoComplete="tel"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-base outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="03XX-XXXXXXX"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !phone}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:shadow-xl hover:shadow-blue-300 disabled:opacity-50"
              >
                {loading ? common("loading") : t("sendResetCode")}
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">{common("or")}</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={() => setStep("newPassword")}
                disabled={loading || !phone}
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-3.5 text-base font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                {t("continueWithoutOTP")}
              </button>
              <p className="text-center text-xs text-gray-400">{t("skipOTPDescription")}</p>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              {t("rememberPassword")}{" "}
              <button
                onClick={() => router.push("/login")}
                className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
              >
                {t("backToLogin")}
              </button>
            </p>
          </>
        )}

        {/* Step: OTP + New Password */}
        {step === "otp" && (
          <>
            {error && (
              <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* DEV MODE: Show the OTP code */}
            {devCode && (
              <div role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
                <p className="text-xs font-medium text-amber-600">{otpT("devCode")}</p>
                <p className="text-2xl font-bold tracking-widest text-amber-800">{devCode}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="otp-code" className="mb-1.5 block text-sm font-medium text-gray-700">
                  {otpT("enterCode")}
                </label>
                <input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-center text-2xl tracking-widest outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="000000"
                />
              </div>

              <div>
                <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-gray-700">
                  {t("newPassword")}
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 pe-12 text-base outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? pwT("hidePassword") : pwT("showPassword")}
                    className="absolute end-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {pwErrors.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {pwErrors.map((err, i) => (
                      <li key={i} className="text-xs text-red-500">• {err}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-gray-700">
                  {t("confirmPassword")}
                </label>
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-base outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{t("passwordMismatch")}</p>
                )}
              </div>

              <button
                onClick={handleResetPassword}
                disabled={loading || otpCode.length !== 6 || pwErrors.length > 0 || !confirmPassword || newPassword !== confirmPassword}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:shadow-xl hover:shadow-blue-300 disabled:opacity-50"
              >
                {loading ? common("loading") : t("resetButton")}
              </button>

              {/* Resend */}
              <div className="text-center">
                <button
                  onClick={handleSendOTP}
                  disabled={loading || cooldown > 0}
                  className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
                >
                  {cooldown > 0 ? `${otpT("resendCode")} (${cooldown}s)` : otpT("resendCode")}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Step: New Password (without OTP) */}
        {step === "newPassword" && (
          <>
            {error && (
              <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button onClick={() => setStep("phone")}
              className="mb-4 flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              {common("back")}
            </button>

            <div className="space-y-5">
              <div>
                <label htmlFor="new-password-no-otp" className="mb-1.5 block text-sm font-medium text-gray-700">
                  {t("newPassword")}
                </label>
                <div className="relative">
                  <input
                    id="new-password-no-otp"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 pe-12 text-base outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? pwT("hidePassword") : pwT("showPassword")}
                    className="absolute end-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {pwErrors.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {pwErrors.map((err, i) => (
                      <li key={i} className="text-xs text-red-500">• {err}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label htmlFor="confirm-password-no-otp" className="mb-1.5 block text-sm font-medium text-gray-700">
                  {t("confirmPassword")}
                </label>
                <input
                  id="confirm-password-no-otp"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-base outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{t("passwordMismatch")}</p>
                )}
              </div>

              <button
                onClick={handleResetWithoutOTP}
                disabled={loading || pwErrors.length > 0 || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:shadow-xl hover:shadow-blue-300 disabled:opacity-50"
              >
                {loading ? common("loading") : t("resetButton")}
              </button>
            </div>
          </>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <>
            <button
              onClick={() => router.push("/login")}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:shadow-xl hover:shadow-blue-300"
            >
              {t("backToLogin")}
            </button>
          </>
        )}
      </div>
    </div>
    </AuthPageWrapper>
  );
}
