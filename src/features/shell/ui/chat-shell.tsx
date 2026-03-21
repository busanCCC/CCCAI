"use client";

import { ChatInput } from "@/features/chat/ui/chat-input";
import { ChatThread } from "@/features/chat/ui/chat-thread";
import { streamChat } from "@/features/chat/api/stream-chat";
import { useChatStore } from "@/features/chat/model/store";
import { useAuthSession } from "@/features/auth/model/use-auth-session";
import {
  fetchMessages,
  difyMessagesToConversationMessages,
} from "@/features/history/api/fetch-messages";
import { Spinner } from "@/components/ui/spinner";
import { ChatHeader } from "@/features/shell/ui/chat-header";
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
    setUserId,
    loadConversation,
  } = useChatStore();
  const { user, isLoading: isAuthLoading } = useAuthSession();

  const [input, setInput] = useState("");
  const [suggestionKey, setSuggestionKey] = useState(0);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (user?.id) {
      setUserId(user.id);
    }
  }, [isAuthLoading, setUserId, user?.id]);

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
    if (!trimmed) return;

    const {
      conversationId: currentConversationId,
      status: currentStatus,
      userId: currentUserId,
    } = useChatStore.getState();
    if (currentStatus === "streaming" || !currentUserId) return;

    clearError();
    addUserMessage(trimmed);
    const assistantId = startAssistantMessage();
    setInput("");

    await streamChat({
      query: trimmed,
      conversationId: currentConversationId,
      userId: currentUserId,
      onChunk: (chunk) => appendAssistantChunk(assistantId, chunk),
      onConversationId: (nextId) => finalizeConversationId(nextId),
      onError: (message) => setError(message),
      onDone: () => finalizeConversationId(),
      onNodeStart: (status) => setProcessingStatus(status),
    });
  }, [
    input,
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

  const handleSelectConversation = useCallback(
    async (selectedConversationId: string) => {
      if (status === "streaming") return;
      try {
        const res = await fetchMessages(selectedConversationId, { limit: 100 });
        const chatMessages = difyMessagesToConversationMessages(res.data ?? []);
        loadConversation(selectedConversationId, chatMessages);
        setSuggestionKey((prev) => prev + 1);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "대화를 불러오지 못했습니다.";
        toast.error(message);
      }
    },
    [status, loadConversation],
  );

  if (isAuthLoading) {
    return (
      <main className="fixed inset-0 flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
        <div className="absolute inset-0 z-0 overflow-hidden bg-linear-to-br from-indigo-50/50 via-white to-yellow-50/50 pointer-events-none">
          <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-primary/20 mix-blend-multiply blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-blue-300/20 mix-blend-multiply blur-[120px]" />
        </div>

        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Spinner className="size-8 text-foreground/80" />
            <p className="text-xs text-foreground/60">로그인 정보 확인중</p>
          </div>
        </div>
      </main>
    );
  }

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
              isAuthenticated={Boolean(user)}
              currentConversationId={conversationId}
              onSelectConversation={handleSelectConversation}
              isStreaming={isStreaming}
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
