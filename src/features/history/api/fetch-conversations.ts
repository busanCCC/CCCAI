"use client";
// NOTE: 대화 목록 조회 클라이언트 API
import type { DifyConversationsResponse } from "@/features/history/model/types";

export type FetchConversationsParams = {
  last_id?: string;
  limit?: number;
  sort_by?: string;
};

export async function fetchConversations(
  params?: FetchConversationsParams,
): Promise<DifyConversationsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.last_id) searchParams.set("last_id", params.last_id);
  if (params?.limit != null) searchParams.set("limit", String(params.limit));
  if (params?.sort_by) searchParams.set("sort_by", params.sort_by);

  const url = `/api/conversations${searchParams.toString() ? `?${searchParams}` : ""}`;
  const res = await fetch(url, { method: "GET", credentials: "include" });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    const message = payload?.error ?? payload?.details ?? `Request failed (${res.status})`;
    throw new Error(typeof message === "string" ? message : "Failed to fetch conversations");
  }

  return res.json();
}
