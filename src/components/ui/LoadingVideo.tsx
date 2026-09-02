"use client";

import { useEffect, useRef } from "react";

export default function LoadingVideo({ visible = true }: { visible?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1;
      if (visible) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [visible]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-300 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <video
        ref={videoRef}
        src="/loading-animation.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="h-auto max-h-[60vh] w-auto max-w-[80vw]"
      />
    </div>
  );
}
