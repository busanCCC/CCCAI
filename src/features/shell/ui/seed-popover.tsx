"use client";

import { ChatDrawer } from "./chat-drawer";

export function SeedPopover() {
  return (
    <div className="flex items-center gap-2">
      <div className="object-cover w-10 h-10 items-center justify-center flex border-none">
          <ChatDrawer />
      </div>
      <h1 className="text-lg font-semibold tracking-tight text-foreground/90">씨앗 순장</h1>
    </div>
  );
}
