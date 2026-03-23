"use client";
// NOTE: 채팅 상태 및 액션을 관리하는 Zustand 스토어
import { create } from "zustand";

import { createId, createUserId } from "@/lib/id";
import {
  isGuestUserId,
  migrateLegacyChatStorage,
  persistConversationId,
  persistGuestUserId,
  readConversationId,
  readGuestUserId,
  removeConversationId,
} from "@/features/chat/model/utils";
import type { ChatMessage, ChatStatus } from "@/features/chat/model/types";

type HydrateSessionOptions = {
  restoreConversation?: boolean;
};

type ChatState = {
  messages: ChatMessage[];
  conversationId: string | null;
  userId: string;
  status: ChatStatus;
  errorMessage: string | null;
  processingStatus: string | null;
  hydrateSession: (
    authUserId?: string | null,
    options?: HydrateSessionOptions,
  ) => void;
  startNewConversation: () => void;
  addUserMessage: (text: string) => void;
  startAssistantMessage: () => string;
  appendAssistantChunk: (messageId: string, chunk: string) => void;
  finalizeConversationId: (conversationId?: string | null) => void;
  ensureAssistantMessageContent: (messageId: string, content: string) => void;
  setError: (message: string) => void;
  clearError: () => void;
  setProcessingStatus: (status: string | null) => void;
  resetSession: () => void;
  loadConversation: (conversationId: string, messages: ChatMessage[]) => void;
};

function getOrCreateGuestUserId() {
  const storedGuestUserId = readGuestUserId();
  if (storedGuestUserId && storedGuestUserId.length > 0) {
    return storedGuestUserId;
  }

  const nextGuestUserId = createUserId();
  persistGuestUserId(nextGuestUserId);
  return nextGuestUserId;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  conversationId: null,
  userId: "",
  status: "idle",
  errorMessage: null,
  processingStatus: null,
  hydrateSession: (authUserId, options) => {
    const normalizedAuthUserId = authUserId?.trim() ?? "";
    const currentState = get();
    const currentUserId = currentState.userId;
    const shouldRestoreConversation =
      Boolean(normalizedAuthUserId) && (options?.restoreConversation ?? true);

    migrateLegacyChatStorage(normalizedAuthUserId || null);

    const nextUserId = normalizedAuthUserId || getOrCreateGuestUserId();
    const restoredConversationId = shouldRestoreConversation
      ? readConversationId(nextUserId)
      : null;

    if (
      currentUserId &&
      currentUserId !== nextUserId &&
      isGuestUserId(currentUserId)
    ) {
      removeConversationId(currentUserId);
    }

    const shouldKeepCurrentMessages =
      currentUserId === nextUserId &&
      currentState.messages.length > 0 &&
      (!shouldRestoreConversation || currentState.conversationId === restoredConversationId);

    set({
      messages: shouldKeepCurrentMessages ? currentState.messages : [],
      conversationId: shouldKeepCurrentMessages
        ? currentState.conversationId
        : restoredConversationId || null,
      userId: nextUserId,
      status: "idle",
      errorMessage: null,
      processingStatus: null,
    });
  },
  startNewConversation: () => {
    const currentUserId = get().userId;
    if (currentUserId) {
      removeConversationId(currentUserId);
    }
    set({
      messages: [],
      conversationId: null,
      status: "idle",
      errorMessage: null,
      processingStatus: null,
    });
  },
  addUserMessage: (text) => {
    const newMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },
  startAssistantMessage: () => {
    const messageId = createId();
    const newMessage: ChatMessage = {
      id: messageId,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
      status: "streaming",
      errorMessage: null,
      processingStatus: "질문을 보고 고민하는중...",
    }));
    return messageId;
  },
  appendAssistantChunk: (messageId, chunk) => {
    set((state) => ({
      // 첫 번째 청크가 도착하면 processingStatus를 null로 설정하여 답변 표시 시작
      processingStatus: null,
      messages: state.messages.map((message) =>
        message.id === messageId ? { ...message, content: message.content + chunk } : message,
      ),
    }));
  },
  finalizeConversationId: (conversationId) => {
    set((state) => {
      const nextId =
        conversationId && conversationId.length > 0 ? conversationId : state.conversationId;
      if (nextId && state.userId) {
        persistConversationId(state.userId, nextId);
      }
      return {
        conversationId: nextId ?? null,
        status: "idle",
        processingStatus: null,
      };
    });
  },
  ensureAssistantMessageContent: (messageId, content) => {
    if (!content.trim()) return;
    set((state) => ({
      messages: state.messages.map((message) => {
        if (message.id !== messageId || message.role !== "assistant") {
          return message;
        }
        if (message.content.trim().length > 0) {
          return message;
        }
        return { ...message, content };
      }),
    }));
  },
  setError: (message) => {
    set({
      status: "error",
      errorMessage: message,
      processingStatus: null,
    });
  },
  clearError: () => {
    set({ errorMessage: null });
  },
  setProcessingStatus: (status) => {
    set({ processingStatus: status });
  },
  resetSession: () => {
    const currentUserId = get().userId;
    const storedGuestUserId = readGuestUserId();

    if (currentUserId && isGuestUserId(currentUserId)) {
      removeConversationId(currentUserId);
    }
    if (storedGuestUserId) {
      removeConversationId(storedGuestUserId);
    }

    const newUserId = createUserId();
    persistGuestUserId(newUserId);
    set({
      messages: [],
      conversationId: null,
      userId: newUserId,
      status: "idle",
      errorMessage: null,
      processingStatus: null,
    });
  },
  loadConversation: (conversationId, messages) => {
    const currentUserId = get().userId;
    if (conversationId && currentUserId) {
      persistConversationId(currentUserId, conversationId);
    }
    set({
      conversationId: conversationId || null,
      messages,
      status: "idle",
      errorMessage: null,
      processingStatus: null,
    });
  },
}));
