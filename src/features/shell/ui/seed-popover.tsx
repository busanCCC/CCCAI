"use client";

import { ChatDrawer } from "./chat-drawer";

export type SeedPopoverProps = {
  isAuthenticated: boolean;
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  isStreaming?: boolean;
};

export function SeedPopover({
  isAuthenticated,
  currentConversationId,
  onSelectConversation,
  isStreaming,
}: SeedPopoverProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="object-cover w-10 h-10 items-center justify-center flex border-none">
        <ChatDrawer
          isAuthenticated={isAuthenticated}
          currentConversationId={currentConversationId}
          onSelectConversation={onSelectConversation}
          isStreaming={isStreaming}
        />
      </div>
      <h1 className="text-lg font-semibold tracking-tight text-foreground/90">
        씨앗 순장
      </h1>
    </div>
  );
}
