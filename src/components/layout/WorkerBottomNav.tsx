"use client";

import { useTranslations } from "next-intl";
import { MobileNav, getWorkerNavItems } from "@/components/layout/MobileNav";

export function WorkerBottomNav() {
  const nav = useTranslations("Nav");
  return <MobileNav role="WORKER" items={getWorkerNavItems(nav)} />;
}
