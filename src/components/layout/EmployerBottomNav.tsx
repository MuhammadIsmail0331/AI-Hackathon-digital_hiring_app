"use client";

import { useTranslations } from "next-intl";
import { MobileNav, getEmployerNavItems } from "@/components/layout/MobileNav";

export function EmployerBottomNav() {
  const nav = useTranslations("Nav");
  return <MobileNav role="EMPLOYER" items={getEmployerNavItems(nav)} />;
}
