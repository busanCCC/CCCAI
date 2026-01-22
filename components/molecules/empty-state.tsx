"use client";
import { EXAMPLE_QUESTIONS } from "@/features/chat/chat.data";
import { motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";

type EmptyStateProps = {
  onSuggestionClick: (question: string) => void;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // NOTE: 컴포넌트 마운트 시 랜덤 질문 3개 선택
    const shuffled = [...EXAMPLE_QUESTIONS].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 3));
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <motion.div
      className="flex min-h-[60dvh] flex-col items-center justify-center gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="relative" variants={itemVariants}>
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
        <div className="relative max-w-[280px] rounded-[2.5rem] border border-primary/20 bg-card/50 p-8 shadow-md backdrop-blur-md">
          <p className="text-sm font-medium leading-relaxed text-foreground/80 md:text-base">
            <span className="font-bold">AI 씨앗 순장</span>님과 대화를 해보세요.
          </p>
        </div>
      </motion.div>

      <div className="flex w-full flex-col gap-2 px-4">
        {suggestions.map((question, index) => (
          <motion.button
            key={index}
            variants={itemVariants}
            onClick={() => onSuggestionClick(question)}
            className="w-full rounded-xl border border-white/20 bg-white/40 px-4 py-3 text-sm text-foreground/80 shadow-sm backdrop-blur-sm transition-all hover:bg-white/60 hover:scale-[1.02] active:scale-95 text-left"
          >
            {question}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
