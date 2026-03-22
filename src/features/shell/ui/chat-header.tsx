"use client";
// NOTE: 로고, 상태 뱃지, 새 대화 시작 액션이 포함된 채팅 헤더
import { Button } from "@/components/ui/button";
import { AuthControls } from "@/features/auth/ui/auth-controls";
import { SeedPopover } from "./seed-popover";

export function ChatHeader({
  onNewConversation,
  isAuthenticated,
  authUserId,
  currentConversationId,
  onSelectConversation,
  onBeforeAuthAction,
}: {
  onNewConversation: () => void;
  isAuthenticated: boolean;
  authUserId: string | null;
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onBeforeAuthAction?: () => void | Promise<void>;
}) {
  return (
    <header className="flex items-center justify-between gap-4 py-2">
      <SeedPopover
        isAuthenticated={isAuthenticated}
        authUserId={authUserId}
        currentConversationId={currentConversationId}
        onSelectConversation={onSelectConversation}
      />
      <div className="flex items-center gap-2">
        <AuthControls onBeforeAuthAction={onBeforeAuthAction} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onNewConversation}
          aria-label="새 대화 시작"
          className="rounded-2xl"
        >
          새 대화
        </Button>
      </div>
    </header>
  );
}
