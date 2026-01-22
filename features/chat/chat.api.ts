"use client";
// NOTE: Next 라우트 핸들러를 통한 Dify SSE 클라이언트 사이드 스트리밍 API 래퍼
import { createSseParser } from "@/features/chat/chat.utils";

export type ChatStreamHandlers = {
  onChunk: (chunk: string) => void;
  onConversationId: (conversationId: string) => void;
  onError: (message: string) => void;
  onDone?: () => void;
  onNodeStart?: (status: string) => void;
};

type ChatStreamParams = {
  query: string;
  conversationId?: string | null;
  userId: string;
  timeoutMs?: number;
} & ChatStreamHandlers;

export async function streamChat({
  query,
  conversationId,
  userId,
  timeoutMs = 60000,
  onChunk,
  onConversationId,
  onError,
  onDone,
  onNodeStart,
}: ChatStreamParams) {
  const controller = new AbortController();
  const parser = createSseParser();
  let lastActivity = Date.now();
  let didError = false;
  const timeout = setInterval(() => {
    if (Date.now() - lastActivity > timeoutMs) {
      controller.abort();
    }
  }, 1000);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        conversation_id: conversationId ?? "",
        user: userId,
      }),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      const contentType = response.headers.get("content-type") ?? "";
      const payload = contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : null;
      const message =
        payload?.error ||
        payload?.message ||
        (await response.text().catch(() => "")) ||
        `Request failed (${response.status})`;
      didError = true;
      onError(message);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      lastActivity = Date.now();
      const chunkText = decoder.decode(value, { stream: true });
      const events = parser(chunkText);

      for (const data of events) {
        let payload: Record<string, unknown> | null = null;
        try {
          payload = JSON.parse(data);
        } catch {
          payload = null;
        }
        if (!payload) continue;
        const event = payload.event;
        if (event === "message") {
          const answer =
            typeof payload.answer === "string" ? payload.answer : "";
          if (answer) onChunk(answer);
        }
        if (event === "message_end") {
          const nextId =
            typeof payload.conversation_id === "string"
              ? payload.conversation_id
              : "";
          if (nextId) onConversationId(nextId);
        }
        if (event === "workflow_started") {
          onNodeStart?.("질문을 보고 고민하는중...");
        }
        if (event === "node_started") {
          const data = payload.data as Record<string, unknown> | undefined;
          const nodeType = data?.node_type as string | undefined;
          const title = data?.title as string | undefined;

          if (nodeType === "knowledge-retrieval") {
            if (title?.includes("TST")) {
              onNodeStart?.("TST 정보 찾아보는 중…");
            } else if (title?.includes("새생활")) {
              onNodeStart?.("새생활 교재에서 관련 부분 찾는 중…");
            } else if (title?.includes("성경")) {
              onNodeStart?.("성경 본문에서 관련 부분 찾는 중…");
            } else if (title?.includes("CCC")) {
              onNodeStart?.("CCC 관련 정보 찾는 중...");
            }
          }
        }
        if (event === "error") {
          const message =
            typeof payload.message === "string"
              ? payload.message
              : "Streaming error";
          didError = true;
          onError(message);
          return;
        }
      }
    }
  } catch (error) {
    if (controller.signal.aborted) {
      didError = true;
      onError("응답이 지연되어 연결이 종료되었습니다. 다시 시도해주세요.");
      return;
    }
    if (error instanceof Error) {
      didError = true;
      onError(error.message || "네트워크 오류가 발생했습니다.");
      return;
    }
    didError = true;
    onError("알 수 없는 오류가 발생했습니다.");
  } finally {
    clearInterval(timeout);
    if (!didError) onDone?.();
  }
}
