import { MessageBubble } from "@/components/molecules/message-bubble";
import { EmptyState } from "@/components/molecules/empty-state";
import type { ChatMessage, ChatStatus } from "@/features/chat/chat.types";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function ChatThread({
  messages,
  status,
  processingStatus,
  onSuggestionClick,
}: {
  messages: ChatMessage[];
  status: ChatStatus;
  processingStatus: string | null;
  onSuggestionClick: (question: string) => void;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: status === "streaming" ? "auto" : "smooth",
    });
  }, [messages, status]);

  const streamingMessageId =
    status === "streaming"
      ? [...messages].reverse().find((message) => message.role === "assistant")
          ?.id
      : undefined;

  return (
    <div className="h-full w-full overflow-y-auto scroll-smooth">
      <div className="mx-auto min-h-full max-w-[600px] px-4 py-8 md:px-0 text-center relative">
        {messages.length === 0 && (
          <div className="absolute inset-0 z-0 flex items-center justify-center px-4">
            <EmptyState onSuggestionClick={onSuggestionClick} />
          </div>
        )}

        <div
          className={cn(
            "relative z-10 flex flex-col gap-6 pb-4 text-left transition-opacity duration-300",
            messages.length > 0
              ? "opacity-100"
              : "opacity-0 pointer-events-none",
          )}
        >
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isStreaming={message.id === streamingMessageId}
              processingStatus={processingStatus}
            />
          ))}
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>
    </div>
  );
}
