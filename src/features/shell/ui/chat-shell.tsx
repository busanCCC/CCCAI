"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ChatInput } from "@/features/chat/ui/chat-input";
import { ChatThread } from "@/features/chat/ui/chat-thread";
import { streamChat } from "@/features/chat/api/stream-chat";
import { getRandomExampleQuestions } from "@/features/chat/model/data";
import { useChatStore } from "@/features/chat/model/store";
import { useAuthSession } from "@/features/auth/model/use-auth-session";
import {
  fetchMessages,
  difyMessagesToConversationMessages,
} from "@/features/history/api/fetch-messages";
import {
  HISTORY_QUERY_STALE_TIME,
  historyQueryKeys,
} from "@/features/history/model/query-keys";
import { ChatHeader } from "@/features/shell/ui/chat-header";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const queryClient = useQueryClient();

  const [input, setInput] = useState("");
  const [suggestionKey, setSuggestionKey] = useState(0);
  const [inputSuggestions, setInputSuggestions] = useState<string[]>([]);
  const authUserId = user?.id ?? null;
  const activeStreamControllerRef = useRef<AbortController | null>(null);

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

  const refreshInputSuggestions = useCallback(() => {
    setInputSuggestions(getRandomExampleQuestions(2));
  }, []);

  useEffect(() => {
    if (messages.length > 0 || inputSuggestions.length > 0) return;
    refreshInputSuggestions();
  }, [messages.length, inputSuggestions.length, refreshInputSuggestions]);

  const invalidateHistoryQueries = useCallback(
    (targetConversationId?: string | null) => {
      void queryClient.invalidateQueries({
        queryKey: historyQueryKeys.conversations(authUserId),
      });
      if (targetConversationId) {
        void queryClient.invalidateQueries({
          queryKey: historyQueryKeys.messages(authUserId, targetConversationId),
        });
      }
    },
    [queryClient, authUserId],
  );

  const stopActiveStream = useCallback(() => {
    const activeController = activeStreamControllerRef.current;
    if (!activeController) return;

    activeStreamControllerRef.current = null;
    activeController.abort();
    finalizeConversationId();
    invalidateHistoryQueries(useChatStore.getState().conversationId);
  }, [finalizeConversationId, invalidateHistoryQueries]);

  useEffect(() => {
    return () => {
      activeStreamControllerRef.current?.abort();
      activeStreamControllerRef.current = null;
    };
  }, []);

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
    const streamController = new AbortController();
    activeStreamControllerRef.current = streamController;

    try {
      await streamChat({
        query: trimmed,
        conversationId: currentConversationId,
        userId: currentUserId,
        signal: streamController.signal,
        onChunk: (chunk) => appendAssistantChunk(assistantId, chunk),
        onConversationId: (nextId) => finalizeConversationId(nextId),
        onError: (message) => setError(message),
        onDone: () => {
          finalizeConversationId();
          invalidateHistoryQueries(useChatStore.getState().conversationId);
        },
        onNodeStart: (status) => setProcessingStatus(status),
      });
    } finally {
      if (activeStreamControllerRef.current === streamController) {
        activeStreamControllerRef.current = null;
      }
    }
  }, [
    input,
    clearError,
    addUserMessage,
    startAssistantMessage,
    appendAssistantChunk,
    finalizeConversationId,
    invalidateHistoryQueries,
    setError,
    setProcessingStatus,
  ]);

  const handleNewConversation = useCallback(() => {
    stopActiveStream();
    startNewConversation();
    setInput("");
    refreshInputSuggestions();
    setSuggestionKey((prev) => prev + 1);
  }, [stopActiveStream, startNewConversation, refreshInputSuggestions]);

  const handleSelectConversation = useCallback(
    async (selectedConversationId: string) => {
      stopActiveStream();
      try {
        const res = await queryClient.fetchQuery({
          queryKey: historyQueryKeys.messages(authUserId, selectedConversationId),
          queryFn: () => fetchMessages(selectedConversationId, { limit: 100 }),
          staleTime: HISTORY_QUERY_STALE_TIME,
        });
        const chatMessages = difyMessagesToConversationMessages(res.data ?? []);
        loadConversation(selectedConversationId, chatMessages);
        setSuggestionKey((prev) => prev + 1);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "대화를 불러오지 못했습니다.";
        toast.error(message);
      }
    },
    [stopActiveStream, queryClient, authUserId, loadConversation],
  );

  return (
    <main className="fixed inset-0 flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground supports-[height:100cqh]:h-[100cqh] supports-[height:100svh]:h-[100svh]">
      <div className="relative z-10 flex h-full w-full flex-col">
        {/* Header Area */}
        <div className="flex-none px-4 py-4 md:px-0 md:py-6">
          <div className="mx-auto max-w-[600px]">
            <ChatHeader
              onNewConversation={handleNewConversation}
              isAuthenticated={Boolean(user)}
              authUserId={authUserId}
              currentConversationId={conversationId}
              onSelectConversation={handleSelectConversation}
              onBeforeAuthAction={stopActiveStream}
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
          />
        </div>

        {/* Input Area (Fixed at bottom of flex container) */}
        <div className="flex-none w-full bg-background px-4 pt-2 pb-4 md:px-0 md:pb-6">
          <div className="mx-auto w-full max-w-[600px] space-y-2">
            {messages.length === 0 && inputSuggestions.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {inputSuggestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => setInput(question)}
                    className="rounded-[18px] bg-muted/75 px-3.5 py-3 text-left text-xs leading-snug font-semibold tracking-[-0.01em] text-foreground/68 hover:bg-muted hover:text-foreground sm:text-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
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
