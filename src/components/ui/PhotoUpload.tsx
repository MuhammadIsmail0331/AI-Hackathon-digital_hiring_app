"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

/**
 * PhotoUpload — client-side compressed photo picker (avatars, portfolios,
 * job images). Photos are compressed on a canvas (~1024px, JPEG q0.72) and
 * stored as data URLs — no external storage service or API key needed.
 */

interface PhotoUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  label?: string;
}

const MAX_DIM = 1024;
const QUALITY = 0.72;

async function compressToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no-canvas");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", QUALITY);
  } finally {
    bitmap.close?.();
  }
}

export function PhotoUpload({ value, onChange, max = 4, label }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const t = useTranslations("Common");

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = max - value.length;
    if (room <= 0) {
      toast.error(t("photoMaxReached") ?? `Max ${max} photos`);
      return;
    }
    setBusy(true);
    const added: string[] = [];
    try {
      for (const file of Array.from(files).slice(0, room)) {
        if (!file.type.startsWith("image/")) continue;
        added.push(await compressToDataUrl(file));
      }
      if (added.length) onChange([...value, ...added]);
    } catch {
      toast.error(t("photoError") ?? "Could not read that image");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(url: string) {
    onChange(value.filter((v) => v !== url));
  }

  return (
    <div>
      {label ? <p className="mb-2 text-sm font-semibold text-ink">{label}</p> : null}
      <div className="flex flex-wrap gap-2">
        {value.map((url) => (
          <div key={url.slice(-24) + url.length} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              aria-label={t("removePhoto") ?? "Remove photo"}
              className="absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white transition hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        ))}
        {value.length < max ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-muted transition hover:border-primary hover:text-primary motion-safe:active:scale-95 disabled:opacity-50"
          >
            {busy ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
            ) : (
              <>📷<span className="text-[10px] font-semibold">{value.length}/{max}</span></>
            )}
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={max > 1}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}