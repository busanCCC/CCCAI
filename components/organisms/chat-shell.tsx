"use client";

import { ChatHeader } from "@/components/organisms/chat-header";
import { ChatThread } from "@/components/organisms/chat-thread";
import { ChatInput } from "@/components/molecules/chat-input";
import { streamChat } from "@/features/chat/chat.api";
import { useChatStore } from "@/features/chat/chat.store";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function ChatShell() {
  const {
    messages,
    conversationId,
    userId,
    status,
    errorMessage,
    processingStatus,
    initFromStorage,
    startNewConversation,
    addUserMessage,
    startAssistantMessage,
    appendAssistantChunk,
    finalizeConversationId,
    setError,
    clearError,
    setProcessingStatus,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [suggestionKey, setSuggestionKey] = useState(0);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage, {
        onAutoClose: () => clearError(),
        onDismiss: () => clearError(),
      });
    }
  }, [errorMessage, clearError]);

  const isStreaming = status === "streaming";
  const isReady = Boolean(userId);
  const isDisabled = isStreaming || !isReady;

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isDisabled) return;

    clearError();
    addUserMessage(trimmed);
    const assistantId = startAssistantMessage();
    setInput("");

    await streamChat({
      query: trimmed,
      conversationId,
      userId,
      onChunk: (chunk) => appendAssistantChunk(assistantId, chunk),
      onConversationId: (nextId) => finalizeConversationId(nextId),
      onError: (message) => setError(message),
      onDone: () => finalizeConversationId(),
      onNodeStart: (status) => setProcessingStatus(status),
    });
  }, [
    input,
    isDisabled,
    conversationId,
    userId,
    clearError,
    addUserMessage,
    startAssistantMessage,
    appendAssistantChunk,
    finalizeConversationId,
    setError,
    setProcessingStatus,
  ]);

  const handleNewConversation = useCallback(() => {
    startNewConversation();
    setInput("");
    setSuggestionKey((prev) => prev + 1);
  }, [startNewConversation]);

  return (
    <main className="fixed inset-0 flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground supports-[height:100cqh]:h-[100cqh] supports-[height:100svh]:h-[100svh]">
      {/* 오로라 배경 */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-linear-to-br from-indigo-50/50 via-white to-yellow-50/50 pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 h-[200%] w-[200%] animate-[aurora_60s_linear_infinite] opacity-60 bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] mix-blend-overlay filter blur-[100px] will-change-transform" />
        <div className="absolute top-0 left-0 h-[600px] w-[600px] rounded-full bg-primary/20 mix-blend-multiply filter blur-[120px] animate-[float_20s_ease-in-out_infinite] will-change-transform" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-300/20 mix-blend-multiply filter blur-[120px] animate-[float-delayed_25s_ease-in-out_infinite] will-change-transform" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-yellow-200/10 mix-blend-overlay filter blur-[100px] will-change-transform" />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col">
        {/* Header Area */}
        <div className="flex-none px-4 py-4 md:px-0 md:py-6">
          <div className="mx-auto max-w-[600px]">
            <ChatHeader
              status={status}
              onNewConversation={handleNewConversation}
            />
          </div>
        </div>

        {/* Chat Thread Area (Scrollable) */}
        <div className="flex-1 min-h-0 w-full">
          <ChatThread
            key={suggestionKey}
            messages={messages}
            status={status}
            processingStatus={processingStatus}
            onSuggestionClick={setInput}
          />
        </div>

        {/* Input Area (Fixed at bottom of flex container) */}
        <div className="flex-none w-full px-4 pb-4 pt-2 md:px-0 md:pb-6 bg-linear-to-t from-white/80 to-transparent backdrop-blur-[1px]">
          <div className="mx-auto w-full max-w-[600px] space-y-2">
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              disabled={isDisabled}
            />
            {!isReady && (
              <p className="text-center text-xs text-muted-foreground font-medium animate-fade-in">
                사용자 식별자를 준비 중입니다...
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
