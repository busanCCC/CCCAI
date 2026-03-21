"use client";
// NOTE: 대화 목록 상태 및 새로고침/페이지네이션 훅
import { useCallback, useEffect, useState } from "react";
import { fetchConversations } from "@/features/history/api/fetch-conversations";
import type { DifyConversation } from "@/features/history/model/types";

const PAGE_SIZE = 10;

type UseConversationHistoryResult = {
  conversations: DifyConversation[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
};

export function useConversationHistory(
  isAuthenticated: boolean,
): UseConversationHistoryResult {
  const [conversations, setConversations] = useState<DifyConversation[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setConversations([]);
      setHasMore(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchConversations({
        limit: PAGE_SIZE,
        sort_by: "-updated_at",
      });
      setConversations(res.data ?? []);
      setHasMore(res.has_more ?? false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "대화 목록을 불러오지 못했습니다.");
      setConversations([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadMore = useCallback(async () => {
    if (!isAuthenticated || isLoadingMore || !hasMore || conversations.length === 0) return;
    const last = conversations[conversations.length - 1];
    if (!last?.id) return;
    setIsLoadingMore(true);
    try {
      const res = await fetchConversations({
        last_id: last.id,
        limit: PAGE_SIZE,
        sort_by: "-updated_at",
      });
      const next = res.data ?? [];
      setConversations((prev) => [...prev, ...next]);
      setHasMore(res.has_more ?? false);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isAuthenticated, isLoadingMore, hasMore, conversations]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { conversations, isLoading, isLoadingMore, hasMore, error, refresh, loadMore };
}
