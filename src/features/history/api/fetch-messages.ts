"use client";
// NOTE: 대화 메시지 히스토리 조회 및 앱 메시지 형식 변환
import type { DifyMessagesResponse, DifyMessage, ConversationMessage } from "@/features/history/model/types";

export async function fetchMessages(
  conversationId: string,
  params?: { first_id?: string; limit?: number },
): Promise<DifyMessagesResponse> {
  const searchParams = new URLSearchParams({ conversation_id: conversationId });
  if (params?.first_id) searchParams.set("first_id", params.first_id);
  if (params?.limit != null) searchParams.set("limit", String(params.limit));

  const res = await fetch(`/api/messages?${searchParams}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    const message = payload?.error ?? payload?.details ?? `Request failed (${res.status})`;
    throw new Error(typeof message === "string" ? message : "Failed to fetch messages");
  }

  return res.json();
}

/** DIFY 메시지 배열을 앱의 대화 메시지 형식(ConversationMessage[])으로 변환 */
export function difyMessagesToConversationMessages(data: DifyMessage[]): ConversationMessage[] {
  const result: ConversationMessage[] = [];
  for (const m of data) {
    if (m.query?.trim()) {
      result.push({
        id: `${m.id}-user`,
        role: "user",
        content: m.query,
        createdAt: m.created_at,
      });
    }
    if (m.answer?.trim()) {
      result.push({
        id: `${m.id}-assistant`,
        role: "assistant",
        content: m.answer,
        createdAt: m.created_at,
      });
    }
  }
  return result;
}
