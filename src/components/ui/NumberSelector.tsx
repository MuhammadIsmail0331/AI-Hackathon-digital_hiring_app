"use client";

import { cn } from "@/lib/utils";

interface NumberSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

export function NumberSelector({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
  className,
}: NumberSelectorProps) {
  function decrement() {
    if (value > min) onChange(value - 1);
  }

  function increment() {
    if (value < max) onChange(value + 1);
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className="inline-flex items-center gap-0 rounded-xl border border-line bg-surface shadow-sm">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-s-xl transition",
            "text-lg font-bold text-muted hover:bg-surface2 active:bg-line",
            "disabled:cursor-not-allowed disabled:text-line disabled:hover:bg-transparent"
          )}
          aria-label="Decrease"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
          </svg>
        </button>

        <div className="flex h-12 w-16 items-center justify-center border-x border-gray-300 text-xl font-semibold text-gray-900">
          {value}
        </div>

        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-e-xl transition",
            "text-lg font-bold text-muted hover:bg-surface2 active:bg-line",
            "disabled:cursor-not-allowed disabled:text-line disabled:hover:bg-transparent"
          )}
          aria-label="Increase"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
