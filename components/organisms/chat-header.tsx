"use client";
// NOTE: 로고, 상태 뱃지, 새 대화 시작 액션이 포함된 채팅 헤더
import { Button } from "@/components/ui/button";
import type { ChatStatus } from "@/features/chat/chat.types";
import Image from "next/image";

export function ChatHeader({
  status,
  onNewConversation,
}: {
  status: ChatStatus;
  onNewConversation: () => void;
}) {
  const isStreaming = status === "streaming";

  return (
    <header className="flex items-center justify-between gap-4 py-2">
      <div className="flex items-center gap-2">
        <div className="object-cover w-10 h-10 items-center justify-center flex rounded-2xl glass-panel shadow-lg ring-1 ring-white/40">
          <Image
            src="/img/씨앗ai.webp"
            alt="씨앗ai"
            width={80}
            height={80}
            className="rounded-full "
          />
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground/90">
          씨앗 순장
        </h1>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onNewConversation}
        disabled={isStreaming}
        aria-label="새 대화 시작"
        className="rounded-full"
      >
        새 대화
      </Button>
    </header>
  );
}
