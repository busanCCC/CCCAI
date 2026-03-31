"use client";
import Image from "next/image";

import { EXAMPLE_QUESTIONS } from "@/features/chat/model/data";

type EmptyStateProps = {
  onSuggestionClick: (question: string) => void;
};

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const suggestions = EXAMPLE_QUESTIONS.slice(0, 3);

  if (suggestions.length === 0) return null;

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-6">
      <div className="w-full max-w-130 px-4">
        <Image
          src="/img/logo.png"
          alt="씨앗 순장"
          width={1600}
          height={1200}
          priority
          className="h-auto w-full object-contain"
        />
      </div>

      <div className="flex w-full max-w-130 flex-col gap-3 px-4">
        {suggestions.map((question) => (
          <button
            key={question}
            onClick={() => onSuggestionClick(question)}
            className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-left text-sm font-medium text-foreground/80 shadow-sm hover:bg-accent/40 hover:text-foreground md:text-base"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
