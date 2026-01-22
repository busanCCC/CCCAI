"use client";
// NOTE: 채팅 상태 및 액션을 관리하는 Zustand 스토어
import { create } from "zustand";

import { createId, createUserId } from "@/lib/id";
import {
  readStorage,
  removeStorage,
  STORAGE_KEYS,
  writeStorage,
} from "@/features/chat/chat.utils";
import type { ChatMessage, ChatStatus } from "@/features/chat/chat.types";

type ChatState = {
  messages: ChatMessage[];
  conversationId: string | null;
  userId: string;
  status: ChatStatus;
  errorMessage: string | null;
  processingStatus: string | null;
  initFromStorage: () => void;
  startNewConversation: () => void;
  addUserMessage: (text: string) => void;
  startAssistantMessage: () => string;
  appendAssistantChunk: (messageId: string, chunk: string) => void;
  finalizeConversationId: (conversationId?: string | null) => void;
  setError: (message: string) => void;
  clearError: () => void;
  setProcessingStatus: (status: string | null) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  conversationId: null,
  userId: "",
  status: "idle",
  errorMessage: null,
  processingStatus: null,
  initFromStorage: () => {
    const storedConversationId = readStorage(STORAGE_KEYS.conversationId);
    const storedUserId = readStorage(STORAGE_KEYS.userId);
    const userId =
      storedUserId && storedUserId.length > 0 ? storedUserId : createUserId();
    if (!storedUserId) {
      writeStorage(STORAGE_KEYS.userId, userId);
    }
    set({
      conversationId: storedConversationId || null,
      userId,
    });
  },
  startNewConversation: () => {
    removeStorage(STORAGE_KEYS.conversationId);
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
        message.id === messageId
          ? { ...message, content: message.content + chunk }
          : message,
      ),
    }));
  },
  finalizeConversationId: (conversationId) => {
    set((state) => {
      const nextId =
        conversationId && conversationId.length > 0
          ? conversationId
          : state.conversationId;
      if (nextId) {
        writeStorage(STORAGE_KEYS.conversationId, nextId);
      }
      return {
        conversationId: nextId ?? null,
        status: "idle",
        processingStatus: null,
      };
    });
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
}));
