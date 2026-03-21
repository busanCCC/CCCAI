"use client";
// NOTE: 대화 목록 상태 및 새로고침/페이지네이션 훅
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback } from "react";

import { fetchConversations } from "@/features/history/api/fetch-conversations";
import { HISTORY_QUERY_STALE_TIME, historyQueryKeys } from "@/features/history/model/query-keys";
import type { DifyConversation } from "@/features/history/model/types";

const PAGE_SIZE = 10;

type UseConversationHistoryOptions = {
  enabled: boolean;
  userId: string | null;
};

type UseConversationHistoryResult = {
  conversations: DifyConversation[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
};

export function useConversationHistory({
  enabled,
  userId,
}: UseConversationHistoryOptions): UseConversationHistoryResult {
  const isAuthenticated = Boolean(userId);

  const query = useInfiniteQuery({
    queryKey: historyQueryKeys.conversations(userId),
    queryFn: ({ pageParam }) =>
      fetchConversations({
        last_id: pageParam,
        limit: PAGE_SIZE,
        sort_by: "-updated_at",
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.has_more) return undefined;
      return lastPage.data[lastPage.data.length - 1]?.id;
    },
    enabled: enabled && isAuthenticated,
    staleTime: HISTORY_QUERY_STALE_TIME,
  });

  const conversations = isAuthenticated
    ? (query.data?.pages.flatMap((page) => page.data ?? []) ?? [])
    : [];
  const error = query.error instanceof Error ? query.error.message : null;
  const isUnauthorizedError = error === "Unauthorized";

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    await query.refetch();
  }, [isAuthenticated, query]);

  const loadMore = useCallback(async () => {
    if (!query.hasNextPage || query.isFetchingNextPage) return;
    await query.fetchNextPage();
  }, [query]);

  return {
    conversations,
    isLoading: isAuthenticated && (query.isPending || (query.isFetching && conversations.length === 0)),
    isLoadingMore: query.isFetchingNextPage,
    hasMore: isAuthenticated && Boolean(query.hasNextPage),
    error: isAuthenticated && !isUnauthorizedError ? error : null,
    refresh,
    loadMore,
  };
}
