"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { DAYS_OF_WEEK, type DayId } from "@/lib/constants";

interface DayPickerProps {
  value: DayId[];
  onChange: (days: DayId[]) => void;
}

export function DayPicker({ value, onChange }: DayPickerProps) {
  const t = useTranslations("Days");
  const common = useTranslations("Common");

  function toggleDay(dayId: DayId) {
    if (value.includes(dayId)) {
      onChange(value.filter((id) => id !== dayId));
    } else {
      onChange([...value, dayId]);
    }
  }

  function selectAll() {
    onChange(DAYS_OF_WEEK.map((d) => d.id));
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-ink">
          {t("title")}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs font-medium text-primary hover:text-primarystrong"
          >
            {common("selectAll")}
          </button>
          <span className="text-line">|</span>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-muted hover:text-ink"
          >
            {common("clear")}
          </button>
        </div>
      </div>
      <div
        role="group"
        aria-label={t("title")}
        className="flex flex-wrap gap-2"
      >
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = value.includes(day.id);
          return (
            <button
              key={day.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggleDay(day.id)}
              className={cn(
                "inline-flex h-12 min-w-[4rem] items-center justify-center rounded-xl border-2 px-3 text-sm font-medium transition",
                "hover:shadow-sm active:scale-[0.97]",
                isSelected
                  ? "border-primary bg-primarysoft text-primary"
                  : "border-line bg-surface text-muted hover:border-muted/50"
              )}
            >
              {t(day.id)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
