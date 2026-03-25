"use client";
// NOTE: 전송 작업이 포함된 채팅 입력 박스
import * as React from "react";
import { ArrowUp, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: (value?: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
};

export function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  isStreaming,
  disabled,
}: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const isComposingRef = React.useRef(false);

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (textarea.value !== value) {
      textarea.value = value;
    }

    if (!value) {
      textarea.scrollTop = 0;
    }
  }, [value]);

  React.useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";

    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = Number.parseFloat(computedStyle.lineHeight) || 24;
    const paddingTop = Number.parseFloat(computedStyle.paddingTop) || 0;
    const paddingBottom = Number.parseFloat(computedStyle.paddingBottom) || 0;
    const borderTopWidth = Number.parseFloat(computedStyle.borderTopWidth) || 0;
    const borderBottomWidth = Number.parseFloat(computedStyle.borderBottomWidth) || 0;
    const minHeight = 48;
    const maxHeight =
      lineHeight * 3 + paddingTop + paddingBottom + borderTopWidth + borderBottomWidth;
    const nextHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight));

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value]);

  const triggerSend = React.useCallback(() => {
    const liveValue = textareaRef.current?.value ?? value;
    if (!liveValue.trim() || isStreaming || disabled) {
      return;
    }
    onSend(liveValue);
  }, [disabled, isStreaming, onSend, value]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const nativeEvent = event.nativeEvent as KeyboardEvent & { isComposing?: boolean };
    const isImeComposing = nativeEvent.isComposing || nativeEvent.keyCode === 229;

    if (isComposingRef.current || isImeComposing) {
      return;
    }

    if (event.key === "Enter" && !event.shiftKey && !isStreaming && !disabled) {
      event.preventDefault();
      event.stopPropagation();
      void Promise.resolve().then(() => triggerSend());
    }
  };

  const isSendDisabled = disabled || !value.trim();

  return (
    <div className="relative rounded-[28px] border-2 border-yellow-400 bg-background shadow-[0_0_0_1px_rgba(250,204,21,0.38)] transition-all duration-300 focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-400/40 dark:border-yellow-400 dark:shadow-[0_0_0_1px_rgba(250,204,21,0.3)]">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false;
        }}
        placeholder="무엇이든 물어보세요..."
        disabled={disabled}
        aria-label="메시지 입력"
        className="min-h-[48px] w-full resize-none border-0 bg-transparent px-4 py-3 pr-16 text-base leading-6 text-foreground shadow-none focus-visible:ring-0 sm:text-sm placeholder:text-muted-foreground/70"
        rows={1}
      />
      <Button
        type="button"
        onClick={isStreaming ? onStop : triggerSend}
        disabled={isStreaming ? disabled : isSendDisabled}
        size="icon"
        aria-label={isStreaming ? "응답 중지" : "메시지 보내기"}
        className={`absolute right-2 bottom-2 h-10 w-10 rounded-[16px] shadow-none hover:translate-y-0 ${
          isStreaming
            ? "bg-foreground text-background hover:bg-foreground/90"
            : "bg-primary text-primary-foreground hover:bg-primary/92"
        }`}
      >
        {isStreaming ? (
          <Square className="h-4 w-4 fill-current" aria-hidden="true" />
        ) : (
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}
