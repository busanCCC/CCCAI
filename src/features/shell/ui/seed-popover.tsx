"use client";

import { ChatDrawer } from "./chat-drawer";

export type SeedPopoverProps = {
  isAuthenticated: boolean;
  authUserId: string | null;
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
};

export function SeedPopover({
  isAuthenticated,
  authUserId,
  currentConversationId,
  onSelectConversation,
}: SeedPopoverProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="object-cover w-10 h-10 items-center justify-center flex border-none">
        <ChatDrawer
          isAuthenticated={isAuthenticated}
          authUserId={authUserId}
          currentConversationId={currentConversationId}
          onSelectConversation={onSelectConversation}
        />
      </div>
      <h1 className="text-lg font-semibold tracking-tight text-foreground/90">
        CCC 씨앗 순장
      </h1>
    </div>
  );
}
