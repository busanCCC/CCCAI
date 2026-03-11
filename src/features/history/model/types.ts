// NOTE: DIFY 대화/메시지 API 응답 타입

export type DifyConversation = {
  id: string;
  name: string;
  inputs?: Record<string, unknown>;
  status?: string;
  introduction?: string | null;
  created_at: number;
  updated_at: number;
};

export type DifyConversationsResponse = {
  limit: number;
  has_more: boolean;
  data: DifyConversation[];
};

export type DifyMessage = {
  id: string;
  conversation_id: string;
  inputs?: Record<string, unknown>;
  query: string;
  answer: string;
  message_files?: unknown[];
  feedback?: { rating?: string } | null;
  retriever_resources?: unknown[];
  created_at: number;
};

export type DifyMessagesResponse = {
  limit: number;
  has_more: boolean;
  data: DifyMessage[];
};

/** 앱 채팅 스레드에서 사용하는 메시지 형식 (history → store 전달용) */
export type ConversationMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
};
