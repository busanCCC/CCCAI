"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ChatInput } from "@/features/chat/ui/chat-input";
import { ChatThread } from "@/features/chat/ui/chat-thread";
import { stopChatGeneration, streamChat } from "@/features/chat/api/stream-chat";
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

const EMPTY_ASSISTANT_FALLBACK_MESSAGE = "오류가 발생했어. 다시 한번 질문해줄래?";
const ABORTED_ASSISTANT_MESSAGE = "답변이 중단되었습니다.";

type ActiveStreamState = {
  controller: AbortController;
  userId: string;
  taskId: string | null;
};

export function ChatShell() {
  const {
    messages,
    conversationId,
    userId,
    status,
    errorMessage,
    processingStatus,
    hydrateSession,
    startNewConversation,
    addUserMessage,
    startAssistantMessage,
    appendAssistantChunk,
    finalizeConversationId,
    ensureAssistantMessageContent,
    setError,
    clearError,
    setProcessingStatus,
    loadConversation,
  } = useChatStore();
  const { user, isLoading: isAuthLoading } = useAuthSession();
  const queryClient = useQueryClient();

  const [input, setInput] = useState("");
  const [suggestionKey, setSuggestionKey] = useState(0);
  const [inputSuggestions, setInputSuggestions] = useState<string[]>([]);
  const [isConversationLoading, setIsConversationLoading] = useState(false);
  const authUserId = user?.id ?? null;
  const activeStreamRef = useRef<ActiveStreamState | null>(null);
  const resolvedAuthUserIdRef = useRef<string | null | undefined>(undefined);
  const restoredConversationKeyRef = useRef<string | null>(null);
  const conversationLoadRequestIdRef = useRef(0);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage, {
        onAutoClose: () => clearError(),
        onDismiss: () => clearError(),
      });
    }
  }, [errorMessage, clearError]);

  const isStreaming = status === "streaming";
  const isReady = Boolean(userId) && !isAuthLoading;

  const refreshInputSuggestions = useCallback(() => {
    setInputSuggestions(getRandomExampleQuestions(2));
  }, []);

  const startConversationLoad = useCallback(() => {
    const nextRequestId = conversationLoadRequestIdRef.current + 1;
    conversationLoadRequestIdRef.current = nextRequestId;
    setIsConversationLoading(true);
    return nextRequestId;
  }, []);

  const finishConversationLoad = useCallback((requestId: number) => {
    if (conversationLoadRequestIdRef.current !== requestId) return;
    setIsConversationLoading(false);
  }, []);

  const cancelConversationLoad = useCallback(() => {
    conversationLoadRequestIdRef.current += 1;
    setIsConversationLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    const nextAuthUserId = user?.id ?? null;
    const previousResolvedAuthUserId = resolvedAuthUserIdRef.current;
    const isFirstResolvedSession = previousResolvedAuthUserId === undefined;
    const didSessionScopeChange = previousResolvedAuthUserId !== nextAuthUserId;

    hydrateSession(nextAuthUserId, {
      restoreConversation: isFirstResolvedSession && Boolean(nextAuthUserId),
    });

    if (didSessionScopeChange) {
      cancelConversationLoad();
      setInput("");
      setSuggestionKey((prev) => prev + 1);
      if (!(isFirstResolvedSession && Boolean(nextAuthUserId))) {
        refreshInputSuggestions();
      }
    }

    resolvedAuthUserIdRef.current = nextAuthUserId;
  }, [
    cancelConversationLoad,
    hydrateSession,
    isAuthLoading,
    refreshInputSuggestions,
    user?.id,
  ]);

  useEffect(() => {
    if (!authUserId || !conversationId) {
      restoredConversationKeyRef.current = null;
      return;
    }
    if (messages.length > 0) return;

    const restoreKey = `${authUserId}:${conversationId}`;
    if (restoredConversationKeyRef.current === restoreKey) return;
    restoredConversationKeyRef.current = restoreKey;

    let isCancelled = false;
    const requestId = startConversationLoad();

    void (async () => {
      try {
        const res = await queryClient.fetchQuery({
          queryKey: historyQueryKeys.messages(authUserId, conversationId),
          queryFn: () => fetchMessages(conversationId, { limit: 100 }),
          staleTime: HISTORY_QUERY_STALE_TIME,
        });

        if (isCancelled) return;
        if (conversationLoadRequestIdRef.current !== requestId) return;

        const currentState = useChatStore.getState();
        if (
          currentState.userId !== authUserId ||
          currentState.conversationId !== conversationId
        ) {
          return;
        }

        const chatMessages = difyMessagesToConversationMessages(res.data ?? []);
        loadConversation(conversationId, chatMessages);
      } catch {
        if (isCancelled) return;
        if (conversationLoadRequestIdRef.current !== requestId) return;

        const currentState = useChatStore.getState();
        if (
          currentState.userId !== authUserId ||
          currentState.conversationId !== conversationId
        ) {
          return;
        }

        startNewConversation();
        refreshInputSuggestions();
        setSuggestionKey((prev) => prev + 1);
      } finally {
        finishConversationLoad(requestId);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [
    authUserId,
    conversationId,
    loadConversation,
    messages.length,
    queryClient,
    refreshInputSuggestions,
    finishConversationLoad,
    startConversationLoad,
    startNewConversation,
  ]);

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
    const activeStream = activeStreamRef.current;
    if (!activeStream) return Promise.resolve();

    activeStreamRef.current = null;
    const stopPromise = activeStream.taskId
      ? stopChatGeneration({
          taskId: activeStream.taskId,
          userId: activeStream.userId,
        }).catch(() => undefined)
      : Promise.resolve(undefined);

    activeStream.controller.abort();
    finalizeConversationId();
    invalidateHistoryQueries(useChatStore.getState().conversationId);

    return stopPromise;
  }, [finalizeConversationId, invalidateHistoryQueries]);

  useEffect(() => {
    return () => {
      activeStreamRef.current?.controller.abort();
      activeStreamRef.current = null;
    };
  }, []);

  const handleSend = useCallback(async (nextValue?: string) => {
    const sourceValue = typeof nextValue === "string" ? nextValue : input;
    const trimmed = sourceValue.trim();
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
    const activeStream: ActiveStreamState = {
      controller: streamController,
      userId: currentUserId,
      taskId: null,
    };
    activeStreamRef.current = activeStream;

    try {
      await streamChat({
        query: trimmed,
        conversationId: currentConversationId,
        userId: currentUserId,
        signal: streamController.signal,
        onChunk: (chunk) => appendAssistantChunk(assistantId, chunk),
        onConversationId: (nextId) => finalizeConversationId(nextId),
        onTaskId: (taskId) => {
          if (activeStreamRef.current === activeStream) {
            activeStream.taskId = taskId;
          }
        },
        onError: (message) => {
          ensureAssistantMessageContent(assistantId, EMPTY_ASSISTANT_FALLBACK_MESSAGE);
          setError(message);
        },
        onAbort: () => {
          ensureAssistantMessageContent(assistantId, ABORTED_ASSISTANT_MESSAGE);
        },
        onDone: () => {
          ensureAssistantMessageContent(assistantId, EMPTY_ASSISTANT_FALLBACK_MESSAGE);
          finalizeConversationId();
          invalidateHistoryQueries(useChatStore.getState().conversationId);
        },
        onNodeStart: (status) => setProcessingStatus(status),
      });
    } finally {
      if (activeStreamRef.current === activeStream) {
        activeStreamRef.current = null;
      }
    }
  }, [
    input,
    clearError,
    addUserMessage,
    startAssistantMessage,
    appendAssistantChunk,
    finalizeConversationId,
    ensureAssistantMessageContent,
    invalidateHistoryQueries,
    setError,
    setProcessingStatus,
  ]);

  const handleNewConversation = useCallback(() => {
    cancelConversationLoad();
    void stopActiveStream();
    startNewConversation();
    setInput("");
    refreshInputSuggestions();
    setSuggestionKey((prev) => prev + 1);
  }, [cancelConversationLoad, stopActiveStream, startNewConversation, refreshInputSuggestions]);

  const handleSelectConversation = useCallback(
    async (selectedConversationId: string) => {
      const requestId = startConversationLoad();
      void stopActiveStream();
      try {
        const res = await queryClient.fetchQuery({
          queryKey: historyQueryKeys.messages(authUserId, selectedConversationId),
          queryFn: () => fetchMessages(selectedConversationId, { limit: 100 }),
          staleTime: HISTORY_QUERY_STALE_TIME,
        });
        if (conversationLoadRequestIdRef.current !== requestId) return;
        const chatMessages = difyMessagesToConversationMessages(res.data ?? []);
        loadConversation(selectedConversationId, chatMessages);
        setSuggestionKey((prev) => prev + 1);
      } catch (e) {
        if (conversationLoadRequestIdRef.current !== requestId) return;
        const message =
          e instanceof Error ? e.message : "대화를 불러오지 못했습니다.";
        toast.error(message);
      } finally {
        finishConversationLoad(requestId);
      }
    },
    [stopActiveStream, queryClient, authUserId, loadConversation, finishConversationLoad, startConversationLoad],
  );

  return (
    <main className="desktop-page-backdrop fixed inset-0 flex h-[100svh] w-full flex-col overflow-hidden bg-background text-foreground supports-[height:100dvh]:h-[100dvh]">
      <div className="desktop-page-surface relative z-10 flex h-full w-full flex-col">
        {/* Header Area */}
        <div className="relative z-20 flex-none bg-background px-4 pt-[calc(env(safe-area-inset-top)+8px)] pb-2 md:px-0 md:py-6">
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
        <div className="flex-1 min-h-0 w-full overflow-hidden">
          <ChatThread
            key={suggestionKey}
            messages={messages}
            status={status}
            processingStatus={processingStatus}
          />
        </div>

        {/* Input Area (Fixed at bottom of flex container) */}
        <div className="relative z-20 flex-none w-full bg-background px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+12px)] md:px-0 md:pb-6">
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
              onStop={() => {
                void stopActiveStream();
              }}
              isStreaming={isStreaming}
              disabled={!isReady || isConversationLoading}
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
