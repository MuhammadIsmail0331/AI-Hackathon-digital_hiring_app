"use client";

import { useTranslations } from "next-intl";
import Navbar from "@/components/layout/Navbar";

export default function TermsPage() {
  const t = useTranslations("Terms");

  const sections = [
    { title: t("accountTitle"), text: t("accountText") },
    { title: t("blockingTitle"), text: t("blockingText") },
    { title: t("jobDeletionTitle"), text: t("jobDeletionText") },
    { title: t("paymentTitle"), text: t("paymentText") },
    { title: t("feedbackTitle"), text: t("feedbackText") },
    { title: t("locationTitle"), text: t("locationText") },
    { title: t("privacyTitle"), text: t("privacyText") },
    { title: t("contactTitle"), text: t("contactText") },
  ];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8 pb-24 sm:pb-8">
        <h1 className="mb-2 text-3xl font-bold text-ink">{t("title")}</h1>
        <p className="mb-8 text-sm text-muted">{t("lastUpdated")}: August 2025</p>

        <div className="mb-8 rounded-2xl border border-primary/30 bg-primarysoft p-5">
          <p className="text-sm text-blue-800">{t("intro")}</p>
        </div>

        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold text-ink">
                {idx + 1}. {section.title}
              </h2>
              <p className="text-sm leading-relaxed text-muted">{section.text}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
