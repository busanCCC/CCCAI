export const HISTORY_QUERY_STALE_TIME = Number.POSITIVE_INFINITY;

export const historyQueryKeys = {
  all: ["history"] as const,
  conversations: (userId: string | null) =>
    [...historyQueryKeys.all, "conversations", userId ?? "guest"] as const,
  messages: (userId: string | null, conversationId: string) =>
    [...historyQueryKeys.all, "messages", userId ?? "guest", conversationId] as const,
};
