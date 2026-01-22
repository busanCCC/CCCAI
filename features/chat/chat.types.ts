// NOTE: 공유 채팅 도메인 타입

export type ChatRole = "user" | "assistant" | "system";

export type ChatStatus = "idle" | "streaming" | "error";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};
