"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SKILLS_MAP, type WorkerCategoryId } from "@/lib/constants";

interface SkillSelectorProps {
  category: WorkerCategoryId | "";
  value: string[];
  onChange: (skills: string[]) => void;
  /** Accessible name for the button group (shown as a heading by the parent page) */
  label?: string;
}

export function SkillSelector({ category, value, onChange, label }: SkillSelectorProps) {
  const t = useTranslations("Skills");

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
      </div>
    </div>
  );
}
