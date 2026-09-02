"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface TimeSelectorProps {
  hour: number; // 1-12
  minute: number; // 0, 15, 30, 45
  period: "AM" | "PM";
  onChange: (hour: number, minute: number, period: "AM" | "PM") => void;
  label?: string;
}

export function TimeSelector({
  hour,
  minute,
  period,
  onChange,
  label,
}: TimeSelectorProps) {
  const t = useTranslations("Jobs");
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = [0, 15, 30, 45];

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}

      {/* Hour Grid: 4x3 */}
      <div>
        <div className="mb-1.5 text-xs font-medium text-gray-500">
          {t("hour")}
        </div>
        <div
          role="group"
          aria-label={t("hour")}
          className="grid grid-cols-6 gap-1.5 sm:grid-cols-12"
        >
          {hours.map((h) => (
            <button
              key={h}
              type="button"
              aria-pressed={hour === h}
              onClick={() => onChange(h, minute, period)}
              className={cn(
                "flex h-10 items-center justify-center rounded-lg text-sm font-medium transition",
                hour === h
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Minute Row */}
      <div>
        <div className="mb-1.5 text-xs font-medium text-gray-500">
          {t("minute")}
        </div>
        <div
          role="group"
          aria-label={t("minute")}
          className="grid grid-cols-4 gap-2"
        >
          {minutes.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={minute === m}
              onClick={() => onChange(hour, m, period)}
              className={cn(
                "flex h-10 items-center justify-center rounded-lg text-sm font-medium transition",
                minute === m
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {String(m).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>

      {/* AM/PM Toggle */}
      <div>
        <div className="mb-1.5 text-xs font-medium text-gray-500">
          {t("period")}
        </div>
        <div
          role="group"
          aria-label={t("period")}
          className="grid grid-cols-2 gap-2"
        >
          {(["AM", "PM"] as const).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={period === p}
              onClick={() => onChange(hour, minute, p)}
              className={cn(
                "flex h-11 items-center justify-center rounded-lg text-sm font-semibold transition",
                period === p
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {p === "AM" ? t("am") : t("pm")}
            </button>
          ))}
        </div>
      </div>

      {/* Current time display */}
      <div className="mt-2 text-center text-lg font-bold text-gray-900">
        {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}{" "}
        {period}
      </div>
    </div>
  );
}
