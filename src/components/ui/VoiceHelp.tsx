"use client";

/**
 * VoiceHelp — floating "Listen / سنیں" button for low-literacy users.
 * Reads a page-specific guidance string aloud using the native Web Speech
 * API (zero backend cost). Picks an Urdu/English voice matching the active
 * locale; degrades to a friendly toast when speech is unavailable.
 */
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { toast } from "sonner";

interface VoiceHelpProps {
  /** Guidance text to speak, in the active locale. */
  text: string;
  label: string;
  notSupportedLabel: string;
  className?: string;
}

export function VoiceHelp({ text, label, notSupportedLabel, className = "" }: VoiceHelpProps) {
  const locale = useLocale();
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function speak() {
    if (!supported) {
      toast.error(notSupportedLabel);
      return;
    }
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = locale === "ur" ? "ur-PK" : "en-PK";
    u.rate = 0.92;
    u.pitch = 1;
    const voices = synth.getVoices();
    const match =
      voices.find((v) => v.lang === u.lang) ||
      voices.find((v) => v.lang.startsWith(locale === "ur" ? "ur" : "en"));
    if (match) u.voice = match;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utterRef.current = u;
    setSpeaking(true);
    synth.speak(u);
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={label}
      aria-pressed={speaking}
      className={
        "tap-ripple motion-safe:active:scale-95 fixed bottom-24 end-4 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:brightness-110 sm:bottom-6 sm:end-6 " +
        className
      }
    >
      <span className={speaking ? "animate-badge-pulse" : ""} aria-hidden="true">
        {speaking ? "◼" : "🔊"}
      </span>
      {speaking ? "…" : label}
    </button>
  );
}
