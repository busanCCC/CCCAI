"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useState, useEffect, useCallback } from "react";
import type { DotLottie } from "@lottiefiles/dotlottie-react";

const LOTTIE_SOURCES = [
  "/lottie/seedAI_1.lottie",
  "/lottie/seedAI_2.lottie",
  "/lottie/seedAI_3.lottie",
];

type SeedLottieProps = {
  onReady?: () => void;
};

export default function SeedLottie({ onReady }: SeedLottieProps) {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  useEffect(() => {
    // 마운트 시 랜덤으로 하나 선택 (hydration mismatch 방지를 위해 useEffect 사용)
    const randomIndex = Math.floor(Math.random() * LOTTIE_SOURCES.length);
    const timeoutId = setTimeout(() => {
      setSelectedSource(LOTTIE_SOURCES[randomIndex]);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const dotLottieRefCallback = useCallback(
    (dotLottie: DotLottie | null) => {
      if (dotLottie) {
        dotLottie.addEventListener("load", () => {
          onReady?.();
        });
      }
    },
    [onReady]
  );

  if (!selectedSource) return null;

  return (
    <div className="relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[160px] md:h-[160px] rounded-full border overflow-hidden flex items-center justify-center [clip-path:circle(50%)] mb-2 sm:mb-4">
      <DotLottieReact 
        src={selectedSource} 
        loop
        autoplay 
        className="w-full h-full"
        dotLottieRefCallback={dotLottieRefCallback}
      />

      {/* 비네트 효과 오버레이 */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none rounded-full"
        style={{
          background: 'radial-gradient(circle, transparent 20%, rgba(255,255,255,0.8) 100%)'
        }}
      />
    </div>
  );
}
