"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SKILLS_MAP, type WorkerCategoryId } from "@/lib/constants";
import { prettyLabel, normalizeCustomValue } from "@/lib/labels";

interface SkillSelectorProps {
  category: WorkerCategoryId | "";
  value: string[];
  onChange: (skills: string[]) => void;
  /** Accessible name for the button group (shown as a heading by the parent page) */
  label?: string;
}

const MAX_SKILLS = 10;

export function SkillSelector({ category, value, onChange, label }: SkillSelectorProps) {
  const t = useTranslations("Skills");
  const [customOpen, setCustomOpen] = useState(false);
  const [customText, setCustomText] = useState("");

  if (!category) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-surface2 p-6 text-center text-sm text-muted">
        Select a worker type first to see available skills
      </div>
    );
  }

  const skills = SKILLS_MAP[category] || [];

  function toggleSkill(skillId: string) {
    if (value.includes(skillId)) {
      onChange(value.filter((id) => id !== skillId));
    } else {
      onChange([...value, skillId]);
    }
  }

  function addCustomSkill() {
    const normalized = normalizeCustomValue(customText);
    if (normalized.length < 2 || value.length >= MAX_SKILLS) return;
    if (!value.includes(normalized)) {
      onChange([...value, normalized]);
    }
    setCustomText("");
    setCustomOpen(false);
  }

  const customSelected = value.filter((id) => !skills.some((s) => s.id === id));

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label={label}
        className="flex flex-wrap gap-2"
      >
        {skills.map((skill) => {
          const isSelected = value.includes(skill.id);
          return (
            <button
              key={skill.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggleSkill(skill.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition",
                "hover:shadow-sm active:scale-[0.97]",
                isSelected
                  ? "border-primary bg-primarysoft text-primary"
                  : "border-line bg-surface text-muted hover:border-muted/50"
              )}
            >
              {t(skill.id)}
              {isSelected && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </button>
          );
        })}

        {/* Custom ("Other") skills — removable chips */}
        {customSelected.map((skillId) => (
          <button
            key={skillId}
            type="button"
            aria-pressed={true}
            onClick={() => toggleSkill(skillId)}
            title={t("remove")}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-primary bg-primarysoft px-3 py-2.5 text-sm font-medium text-primary transition hover:shadow-sm active:scale-[0.97]"
          >
            {prettyLabel(skillId)}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        ))}

        {/* "Other" toggle */}
        <button
          type="button"
          aria-pressed={customOpen}
          onClick={() => setCustomOpen((o) => !o)}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border-2 border-dashed px-3 py-2.5 text-sm font-medium transition",
            "hover:shadow-sm active:scale-[0.97]",
            customOpen
              ? "border-primary bg-primarysoft text-primary"
              : "border-line bg-surface text-muted hover:border-muted/50"
          )}
        >
          {t("other")}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </button>
      </div>

      {customOpen && (
        <div className="flex gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomSkill();
              }
            }}
            placeholder={t("otherPlaceholder")}
            maxLength={40}
            autoComplete="off"
            className="w-full rounded-xl border-2 border-primary/40 bg-surface px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={addCustomSkill}
            disabled={normalizeCustomValue(customText).length < 2 || value.length >= MAX_SKILLS}
            className="shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primarystrong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("add")}
          </button>
        </div>
      )}
    </div>
  );
}
