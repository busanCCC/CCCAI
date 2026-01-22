"use client";
// NOTE: 전송 작업이 포함된 채팅 입력 박스
import type * as React from "react";
import { SendHorizonal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
}: ChatInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative flex items-center gap-2 rounded-full glass-panel-heavy p-0.5 pr-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-300">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="무엇이든 물어보세요..."
        disabled={disabled}
        aria-label="메시지 입력"
        className="min-h-[48px] max-h-[120px] flex-1 shadow-none resize-none bg-transparent border-0 focus-visible:ring-0 px-4 py-3 text-sm placeholder:text-muted-foreground/70"
        rows={1}
      />
      <Button
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        size="icon"
        aria-label="메시지 보내기"
        className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground shadow-sm hover:translate-y-[-2px] hover:shadow-lg hover:bg-yellow-400 transition-all active:translate-y-0"
      >
        <SendHorizonal className="h-5 w-5" aria-hidden="true" />
      </Button>
    </div>
  );
}
