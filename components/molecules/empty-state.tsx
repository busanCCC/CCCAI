"use client";
import { EXAMPLE_QUESTIONS } from "@/features/chat/chat.data";
import { useEffect, useState, useCallback } from "react";
import SeedLottie from "./seed-lottie";
import { Spinner } from "@/components/ui/spinner";

type EmptyStateProps = {
  onSuggestionClick: (question: string) => void;
};

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLottieReady, setIsLottieReady] = useState(false);

  useEffect(() => {
    // NOTE: 컴포넌트 마운트 시 한 번만 랜덤 질문 3개 선택
    const shuffled = [...EXAMPLE_QUESTIONS].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 3));
  }, []);

  const handleLottieReady = useCallback(() => {
    setIsLottieReady(true);
  }, []);

  // hydration mismatch 방지를 위해 suggestions가 없을 때는 렌더링하지 않음 (또는 스켈레톤)
  if (suggestions.length === 0) return null;

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 sm:gap-8 animate-fade-in">
      <div className="relative animate-slide-up flex flex-col items-center justify-center">
        {!isLottieReady && (
          <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[160px] md:h-[160px] flex items-center justify-center mb-2 sm:mb-4">
            <Spinner className="size-8 text-primary/60" />
          </div>
        )}
        <div className={isLottieReady ? "animate-fade-in" : "sr-only"}>
          <SeedLottie onReady={handleLottieReady} />
        </div>
        {isLottieReady && (
          <>
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-fade-in" />
            <div className="relative max-w-[400px] rounded-[2.5rem] border border-primary/20 bg-card/50 p-4 sm:p-8 shadow-md backdrop-blur-md animate-slide-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
              <p className="text-sm font-medium leading-relaxed text-foreground/80 md:text-base">
                <span className="font-bold">AI 씨앗 순장</span>님과 대화를 해보세요.
              </p>
            </div>
          </>
        )}
      </div>

      {isLottieReady && (
        <div className="flex w-full flex-col gap-2 px-4">
          {suggestions.map((question, index) => (
            <button
              key={question}
              onClick={() => onSuggestionClick(question)}
              className="w-full rounded-2xl border border-border/50 bg-card/30 px-6 py-4 text-left text-sm text-foreground/80 transition-all hover:bg-accent/50 hover:text-foreground active:scale-[0.98] md:text-base animate-slide-up"
              style={{
                animationDelay: `${(index + 1) * 0.15}s`,
                animationFillMode: "both",
              }}
            >
              {question}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
