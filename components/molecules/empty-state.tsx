"use client";
import { EXAMPLE_QUESTIONS } from "@/features/chat/chat.data";
import { useEffect, useState } from "react";
import Image from "next/image";
import SeedLottie from "./seed-lottie";
type EmptyStateProps = {
  onSuggestionClick: (question: string) => void;
};

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // NOTE: 컴포넌트 마운트 시 한 번만 랜덤 질문 3개 선택
    const shuffled = [...EXAMPLE_QUESTIONS].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 3));
  }, []);

  // hydration mismatch 방지를 위해 suggestions가 없을 때는 렌더링하지 않음 (또는 스켈레톤)
  if (suggestions.length === 0) return null;

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-8 animate-fade-in">
      <div className="relative animate-slide-up flex flex-col items-center justify-center">
          <SeedLottie />
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
        <div className="relative max-w-[400px] rounded-[2.5rem] border border-primary/20 bg-card/50 p-8 shadow-md backdrop-blur-md">
          <p className="text-sm font-medium leading-relaxed text-foreground/80 md:text-base">
            <span className="font-bold">AI 씨앗 순장</span>님과 대화를 해보세요.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 px-4">
        {suggestions.map((question, index) => (
          <button
            key={question}
            onClick={() => onSuggestionClick(question)}
            className="w-full rounded-2xl border border-border/50 bg-card/30 px-6 py-4 text-left text-sm text-foreground/80 transition-all hover:bg-accent/50 hover:text-foreground active:scale-[0.98] md:text-base animate-slide-up"
            style={{
              animationDelay: `${(index + 1) * 0.1}s`,
              animationFillMode: "both",
            }}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
