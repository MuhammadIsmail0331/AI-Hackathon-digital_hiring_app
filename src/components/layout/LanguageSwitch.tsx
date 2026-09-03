"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function LanguageSwitch() {
  const locale = useLocale();
  const otherLocale = locale === "en" ? "ur" : "en";
  const label = locale === "en" ? "اردو" : "English";

  return (
    <Link
      href="/"
      locale={otherLocale}
      className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition hover:border-primary/40 hover:text-primary"
      aria-label="Switch language"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      {label}
    </Link>
  );
}
