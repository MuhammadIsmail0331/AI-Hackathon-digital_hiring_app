"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import AuthPageWrapper from "@/components/layout/AuthPageWrapper";
import type { Role } from "@/lib/constants";

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const common = useTranslations("Common");
  const pwT = useTranslations("Password");
  const otpT = useTranslations("OTP");
  const router = useRouter();

  const [step, setStep] = useState<"role" | "details" | "otp">("role");
  const [role, setRole] = useState<Role | "">("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Password strength
  const [pwErrors, setPwErrors] = useState<string[]>([]);

  // OTP
  const [otpCode, setOtpCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Duplicate account redirect
  const [duplicateLogin, setDuplicateLogin] = useState(false);

  function handleRoleSelect(selectedRole: Role) {
    setRole(selectedRole);
    setStep("details");
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    // Live strength check
    const errors: string[] = [];
    if (value.length < 8) errors.push(pwT("minLength"));
    if (!/[A-Z]/.test(value)) errors.push(pwT("uppercase"));
    if (!/[a-z]/.test(value)) errors.push(pwT("lowercase"));
    if (!/[0-9]/.test(value)) errors.push(pwT("number"));
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) errors.push(pwT("special"));
    setPwErrors(errors);
  }

  const pwStrength =
    pwErrors.length === 0 ? "strong" : pwErrors.length <= 2 ? "medium" : "weak";
  const pwColor =
    pwStrength === "strong"
      ? "bg-green-500"
      : pwStrength === "medium"
      ? "bg-yellow-500"
      : "bg-red-500";
  const pwWidth =
    password.length === 0 ? "0%" : pwStrength === "strong" ? "100%" : pwStrength === "medium" ? "60%" : "30%";

  async function handleSendOTP() {
    if (!phone) return;
    setError("");
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.existingAccount) {
          setDuplicateLogin(true);
          setError(data.error || otpT("existingAccount"));
        } else {
          setError(data.error || common("error"));
        }
        return;
      }
      setOtpSent(true);
      setDevCode(data.code || "");
      setStep("otp");
      // Start cooldown timer (60 seconds)
      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError(common("error"));
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleVerifyOTP() {
    if (!otpCode || otpCode.length !== 6) return;
    setError("");
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || otpT("invalidCode"));
        return;
      }
      setPhoneVerified(true);
      // Now submit the registration
      await submitRegistration(otpCode);
    } catch {
      setError(common("error"));
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleRegisterWithoutOTP() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.existingAccount) {
          setDuplicateLogin(true);
        }
        setError(data.error || common("error"));
        return;
      }
      // Auto-login worker and redirect to profile setup
      if (role === "WORKER") {
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (signInResult?.error) {
          router.push("/login");
        } else {
          router.push("/worker/profile");
          router.refresh();
        }
      } else {
        router.push("/login");
      }
    } catch {
      setError(common("error"));
    } finally {
      setLoading(false);
    }
  }

  async function submitRegistration(code: string) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role, otpCode: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.existingAccount) {
          setDuplicateLogin(true);
        }
        setError(data.error || common("error"));
        return;
      }
      // Auto-login worker and redirect to profile setup
      if (role === "WORKER") {
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (signInResult?.error) {
          router.push("/login");
        } else {
          router.push("/worker/profile");
          router.refresh();
        }
      } else {
        router.push("/login");
      }
    } catch {
      setError(common("error"));
    } finally {
      setLoading(false);
    }
  }

  // Eye icon SVG
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
    <div className="mx-auto max-w-md">
      {step === "role" && (
        <div className="space-y-6">
          <h1 className="text-center text-2xl font-bold text-gray-900">
            {t("chooseRole")}
          </h1>

          <div className="grid gap-4">
            {/* Employer Card */}
            <button
              onClick={() => handleRoleSelect("EMPLOYER")}
              className="group overflow-hidden rounded-2xl border-2 border-gray-200 bg-white text-start shadow-sm transition hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100"
            >
              <div className="flex items-center gap-4 p-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 transition group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t("employer")}</h2>
                  <p className="mt-0.5 text-sm text-gray-500">{t("employerDesc")}</p>
                </div>
              </div>
            </button>

            {/* Worker Card */}
            <button
              onClick={() => handleRoleSelect("WORKER")}
              className="group overflow-hidden rounded-2xl border-2 border-gray-200 bg-white text-start shadow-sm transition hover:border-green-400 hover:shadow-lg hover:shadow-green-100"
            >
              <div className="flex items-center gap-4 p-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-green-200 text-green-600 transition group-hover:from-green-500 group-hover:to-green-600 group-hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t("worker")}</h2>
                  <p className="mt-0.5 text-sm text-gray-500">{t("workerDesc")}</p>
                </div>
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-gray-500">
            {t("hasAccount")}{" "}
            <button onClick={() => router.push("/login")} className="font-semibold text-blue-600 hover:underline">
              {t("loginHere")}
            </button>
          </p>
        </div>
      )}

      {step === "details" && (
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl shadow-gray-200/40 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-center">
            <h1 className="text-xl font-bold text-white">{t("registerTitle")}</h1>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
              {role === "EMPLOYER" ? t("employer") : t("worker")}
            </div>
          </div>
          <div className="p-8">
          <button onClick={() => setStep("role")} className="mb-4 flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            {common("back")}
          </button>

          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">{t("registerTitle")}</h2>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {role === "EMPLOYER" ? t("employer") : t("worker")}
          </div>

          {error && (
            <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
              {duplicateLogin && (
                <button onClick={() => router.push("/login")} className="ms-2 font-semibold text-blue-600 underline">
                  {otpT("goToLogin")}
                </button>
              )}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendOTP();
            }}
            className="space-y-5"
          >
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">{t("fullName")}</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-base outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" />
            </div>

            <div>
              <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-gray-700">{t("email")}</label>
              <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-base outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="example@email.com" />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700">{t("phone")}</label>
              <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required autoComplete="tel"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-base outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="03XX-XXXXXXX" />
            </div>

            <div>
              <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-gray-700">{t("password")}</label>
              <div className="relative">
                <input id="reg-password" type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)} required minLength={8} autoComplete="new-password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 pe-12 text-base outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                  aria-label={showPassword ? pwT("hidePassword") : pwT("showPassword")}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-gray-500">{pwT("strength")}</span>
                    <span className={pwStrength === "strong" ? "font-semibold text-green-600" : pwStrength === "medium" ? "font-semibold text-yellow-600" : "font-semibold text-red-600"}>
                      {pwStrength === "strong" ? pwT("strong") : pwStrength === "medium" ? pwT("medium") : pwT("weak")}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                    <div className={`h-full rounded-full transition-all ${pwColor}`} style={{ width: pwWidth }} />
                  </div>
                  {pwErrors.length > 0 && (
                    <ul className="mt-2 space-y-0.5">
                      {pwErrors.map((err, i) => (
                        <li key={i} className="text-xs text-red-500">• {err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading || otpLoading || pwErrors.length > 0}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:shadow-xl hover:shadow-blue-300 disabled:opacity-50">
              {otpLoading ? common("loading") : otpT("sendCode")}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">{common("or")}</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <button type="button" onClick={handleRegisterWithoutOTP}
              disabled={loading || otpLoading || pwErrors.length > 0 || !name || !email || !phone || !password}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-3.5 text-base font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50">
              {loading ? common("loading") : otpT("continueWithoutOTP")}
            </button>
            <p className="text-center text-xs text-gray-400">{otpT("skipOTPDescription")}</p>
          </form>
          </div>
        </div>
      )}

      {step === "otp" && (
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl shadow-gray-200/40 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-center">
            <h1 className="text-xl font-bold text-white">{otpT("title")}</h1>
            <p className="mt-1 text-sm text-blue-100">{otpT("description")}</p>
          </div>
          <div className="p-8">
            <button onClick={() => { setStep("details"); setOtpSent(false); setDevCode(""); }}
              className="mb-4 flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            {common("back")}
          </button>

          <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">{otpT("title")}</h2>
          <p className="mb-6 text-center text-sm text-gray-500">{otpT("description")}</p>

          {error && (
            <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
              {duplicateLogin && (
                <button onClick={() => router.push("/login")} className="ms-2 font-semibold text-blue-600 underline">
                  {otpT("goToLogin")}
                </button>
              )}
            </div>
          )}

          {otpSent && (
            <div role="status" className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-center text-sm text-green-700">
              {otpT("codeSent")}
            </div>
          )}

          {/* DEV MODE: Show the OTP code */}
          {devCode && (
            <div role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
              <p className="text-xs font-medium text-amber-600">{otpT("devCode")}</p>
              <p className="text-2xl font-bold tracking-widest text-amber-800">{devCode}</p>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="otp-code" className="mb-1.5 block text-sm font-medium text-gray-700">{otpT("enterCode")}</label>
            <input id="otp-code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-center text-2xl tracking-widest outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              placeholder="000000" />
          </div>

          <button onClick={handleVerifyOTP} disabled={otpLoading || otpCode.length !== 6}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:shadow-xl hover:shadow-blue-300 disabled:opacity-50">
            {otpLoading ? common("loading") : otpT("verifyCode")}
          </button>

          {/* Resend */}
          <div className="mt-4 text-center">
            <button onClick={handleSendOTP} disabled={otpLoading || cooldown > 0}
              className="text-sm font-medium text-blue-600 transition hover:text-blue-700 hover:underline disabled:opacity-50">
              {cooldown > 0 ? `${otpT("resendCode")} (${cooldown}s)` : otpT("resendCode")}
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
    </AuthPageWrapper>
  );
}
