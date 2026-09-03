"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  WORKER_CATEGORIES,
  categoryGradient,
  type WorkerCategoryId,
} from "@/lib/constants";

/**
 * Category icon map using simple SVG icons.
 * Each icon is designed to be recognizable at small sizes.
 */
const CATEGORY_ICONS: Record<WorkerCategoryId, React.ReactNode> = {
  painter: (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z" />
      <path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7" />
      <path d="M14.5 17.5 4.5 15" />
    </svg>
  ),
  plumber: (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v6" /><path d="M12 22v-6" />
      <path d="M6 12H2" /><path d="M22 12h-4" />
      <circle cx="12" cy="12" r="4" />
      <path d="M6 8l-2-2" /><path d="M20 18l-2-2" />
    </svg>
  ),
  electrician: (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  carpenter: (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 12-8.373 8.373a2.625 2.625 0 1 1-3.75-3.75L11 8.5" />
      <path d="m18 9 4-4" /><path d="m15 12 3-3" />
      <path d="m14 2 4 4" /><path d="m21 9-4-4" />
    </svg>
  ),
  mason: (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 18h20" /><path d="M2 14h20" />
      <path d="M6 14v4" /><path d="M12 14v4" />
      <path d="M18 14v4" /><path d="M9 18v4" />
      <path d="M15 18v4" /><path d="M3 14V8h18v6" />
      <path d="M7 8V2h10v6" />
    </svg>
  ),
  labourer: (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  cleaner: (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  ),
  welder: (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  gardener: (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 0 4.5 4.5M7.5 12H9m7.5 0a4.5 4.5 0 1 1-4.5 4.5m4.5-4.5H15m-3 4.5V15" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  driver: (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
      <circle cx="6.5" cy="16.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  ),
  helper: (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5-3 9-7.5 9-12A9 9 0 0 0 3 10c0 5.5 4 9 9 12z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  other: (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  ),
};

interface CategorySelectorProps {
  disabled?: boolean;
  value?: WorkerCategoryId | "";
  onChange: (categoryId: WorkerCategoryId) => void;
  /** Current text for a custom ("Other") worker type. */
  customValue?: string;
  /** Called when the custom worker-type text changes. Required to show the input. */
  onCustomChange?: (value: string) => void;
}

export function CategorySelector({
  value,
  onChange,
  disabled = false,
  customValue,
  onCustomChange,
}: CategorySelectorProps) {
  const t = useTranslations("Categories");

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-ink">
        {t("title")}
      </label>
      <div
        role="group"
        aria-label={t("title")}
        className="grid grid-cols-3 gap-3 sm:grid-cols-4"
      >
        {WORKER_CATEGORIES.map((cat) => {
          const isSelected = value === cat.id;
          const colors = categoryGradient(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(cat.id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition",
                "hover:shadow-md active:scale-[0.97]",
                disabled && "opacity-60 cursor-not-allowed",
                isSelected
                  ? "border-primary bg-primarysoft text-primary shadow-sm ring-2 ring-primary/20"
                  : "border-line bg-surface text-muted hover:border-muted/50"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg transition",
                  isSelected
                    ? "bg-gradient-to-br text-white shadow-sm " + colors.from + " " + colors.to
                    : "bg-surface2 text-muted"
                )}
              >
                {CATEGORY_ICONS[cat.id]}
              </div>
              <span className="text-sm font-medium">{t(cat.id)}</span>
            </button>
          );
        })}
      </div>

      {value === "other" && onCustomChange && (
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

export { CATEGORY_ICONS };
