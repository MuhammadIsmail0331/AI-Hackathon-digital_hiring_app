"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { TOOLS, type ToolId } from "@/lib/constants";

const TOOL_ICONS: Record<ToolId, React.ReactNode> = {
  hammer: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 12-8.373 8.373a2.625 2.625 0 1 1-3.75-3.75L11 8.5" />
      <path d="m18 9 4-4" /><path d="m15 12 3-3" />
    </svg>
  ),
  drill: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.4 14.4 9.6 19.2" />
      <circle cx="16" cy="8" r="5" />
      <path d="M7 17l-2 2" />
    </svg>
  ),
  wrench: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  saw: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m11 7-4 4-2-2" /><path d="m5 13 4-4" />
      <path d="M3 21 17 7" /><path d="M20 4 9 15" />
      <path d="m21 7-2 2" />
    </svg>
  ),
  ladder: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v20" /><path d="M16 2v20" />
      <path d="M8 6h8" /><path d="M8 12h8" />
      <path d="M8 18h8" />
    </svg>
  ),
  paint_roller: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="18" height="6" rx="2" />
      <path d="M11 8v4" /><path d="M11 12h4a2 2 0 0 1 2 2v6" />
      <path d="M17 20h2" />
    </svg>
  ),
  brush: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z" />
      <path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7" />
    </svg>
  ),
  shovel: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2" />
      <path d="M12 10v12" />
      <path d="M8 22h8" />
    </svg>
  ),
  wheelbarrow: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16h12l2-8H6l-2 8z" />
      <circle cx="18" cy="18" r="3" />
      <path d="M2 16h2" /><path d="M14 16v2" />
    </svg>
  ),
  safety_gear: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  measuring_tape: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5v14" /><path d="M7 5v14" />
      <path d="M3 5h4" /><path d="M3 9h2" />
      <path d="M3 13h2" /><path d="M3 17h4" />
      <rect x="7" y="3" width="14" height="18" rx="1" />
    </svg>
  ),
  pliers: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l4 4" /><path d="M18 9l-4 4" />
      <circle cx="12" cy="13" r="2" />
      <path d="M8 17l-4 4" /><path d="M16 17l4 4" />
      <path d="M10 3l2 6 2-6" />
    </svg>
  ),
};

interface ToolSelectorProps {
  value: ToolId[];
  onChange: (tools: ToolId[]) => void;
}

export function ToolSelector({ value, onChange }: ToolSelectorProps) {
  const t = useTranslations("Tools");

  function toggleTool(toolId: ToolId) {
    if (value.includes(toolId)) {
      onChange(value.filter((id) => id !== toolId));
    } else {
      onChange([...value, toolId]);
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-ink">
        {t("title")}
      </label>
      <div
        role="group"
        aria-label={t("title")}
        className="flex flex-wrap gap-2"
      >
        {TOOLS.map((tool) => {
          const isSelected = value.includes(tool.id);
          return (
            <button
              key={tool.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggleTool(tool.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition",
                "hover:shadow-sm active:scale-[0.97]",
                isSelected
                  ? "border-primary bg-primarysoft text-primary"
                  : "border-line bg-surface text-muted hover:border-muted/50"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded",
                  isSelected ? "text-primary" : "text-muted"
                )}
              >
                {TOOL_ICONS[tool.id]}
              </span>
              {t(tool.id)}
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

export { TOOL_ICONS };
