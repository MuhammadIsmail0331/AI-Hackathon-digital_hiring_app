"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { PAKISTAN_CITIES, type CityId } from "@/lib/constants";

interface CitySelectorProps {
  value?: CityId | "";
  onChange: (cityId: CityId) => void;
  /** Accessible name for the button group (shown as a heading by the parent page) */
  label?: string;
  /** Current text for a custom ("Other City") name. */
  customValue?: string;
  /** Called when the custom city name changes. Required to show the input. */
  onCustomChange?: (value: string) => void;
}

export function CitySelector({
  value,
  onChange,
  label,
  customValue,
  onCustomChange,
}: CitySelectorProps) {
  const t = useTranslations("Cities");

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label={label}
        className="grid grid-cols-3 gap-2 sm:grid-cols-4"
      >
        {PAKISTAN_CITIES.map((city) => {
          const isSelected = value === city.id;
          return (
            <button
              key={city.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(city.id)}
              className={cn(
                "rounded-xl border-2 px-3 py-2.5 text-center text-sm font-medium transition",
                "hover:shadow-sm active:scale-[0.97]",
                isSelected
                  ? "border-primary bg-primarysoft text-primary"
                  : "border-line bg-surface text-muted hover:border-muted/50"
              )}
            >
              {t(city.id)}
            </button>
          );
        })}
      </div>

      {value === "other_city" && onCustomChange && (
        <input
          type="text"
          value={customValue ?? ""}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder={t("otherPlaceholder")}
          maxLength={40}
          autoComplete="off"
          className="w-full rounded-xl border-2 border-primary/40 bg-surface px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      )}
    </div>
  );
}
