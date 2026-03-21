"use client";
// NOTE: 전송 작업이 포함된 채팅 입력 박스
import type * as React from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative flex items-center gap-2 rounded-full border-2 border-yellow-400 bg-background p-0.5 pr-2 shadow-[0_0_0_1px_rgba(250,204,21,0.38)] transition-all duration-300 focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-400/40 dark:border-yellow-400 dark:shadow-[0_0_0_1px_rgba(250,204,21,0.3)]">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="무엇이든 물어보세요..."
        disabled={disabled}
        aria-label="메시지 입력"
        className="min-h-[48px] max-h-[120px] flex-1 resize-none border-0 bg-transparent px-4 py-3 text-base text-foreground shadow-none focus-visible:ring-0 sm:text-sm placeholder:text-muted-foreground/70"
        rows={1}
      />
      <Button
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        size="icon"
        aria-label="메시지 보내기"
        className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-lg hover:bg-yellow-400 transition-all active:translate-y-0"
      >
        <ArrowUp className="h-5 w-5" aria-hidden="true" />
      </Button>
    </div>
  );
}
