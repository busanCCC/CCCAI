"use client";
// NOTE: 대화 목록 상태 및 새로고침 훅
import { useCallback, useEffect, useState } from "react";
import { fetchConversations } from "@/features/history/api/fetch-conversations";
import type { DifyConversation } from "@/features/history/model/types";

type UseConversationHistoryResult = {
  conversations: DifyConversation[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useConversationHistory(
  isAuthenticated: boolean,
): UseConversationHistoryResult {
  const [conversations, setConversations] = useState<DifyConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setConversations([]);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchConversations({ limit: 50, sort_by: "-updated_at" });
      setConversations(res.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "대화 목록을 불러오지 못했습니다.");
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { conversations, isLoading, error, refresh };
}
