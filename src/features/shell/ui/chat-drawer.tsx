"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { useConversationHistory } from "@/features/history/model/use-conversation-history";
import { Menu, House, Captions, MessageSquare, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
  { label: "홈", icon: "House", link: "/" },
  { label: "목요채플 요약", icon: "Captions", link: "/captions" },
  {
    label: "인스타그램",
    icon: "Instagram",
    link: "https://www.instagram.com/c_at_ccc",
  },
];

function formatRelativeTime(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000) return "방금 전";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}분 전`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}시간 전`;
  if (diff < 604800_000) return `${Math.floor(diff / 86400_000)}일 전`;
  return new Date(ms).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

export type ChatDrawerProps = {
  isAuthenticated: boolean;
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  isStreaming?: boolean;
};

export function ChatDrawer({
  isAuthenticated,
  currentConversationId,
  onSelectConversation,
  isStreaming = false,
}: ChatDrawerProps) {
  const {
    conversations,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
  } = useConversationHistory(isAuthenticated);

  return (
    <div className="flex flex-wrap gap-2">
      <Drawer direction="left" onOpenChange={(open) => open && refresh()}>
        <DrawerTrigger asChild>
          <button
            className="p-2 rounded-lg transition-colors duration-150 hover:bg-accent active:bg-accent/80 active:scale-[0.95] transform"
            aria-label="메뉴 열기"
          >
            <Menu className="w-5 h-5" />
          </button>
        </DrawerTrigger>
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[50vh] data-[vaul-drawer-direction=top]:max-h-[50vh]">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-black tracking-tight text-amber-500">
              씨앗 순장
            </DrawerTitle>
            <DrawerDescription>
              씨앗 순장에게서 다양한 정보를 받아보세요.
            </DrawerDescription>
          </DrawerHeader>
          <div className="no-scrollbar overflow-y-auto px-4">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.link}
                className="flex items-center gap-3 px-3 py-2.5 -mx-1 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-accent active:bg-accent/80 active:scale-[0.98] transform"
              >
                {item.icon === "House" && <House className="w-4 h-4 shrink-0" />}
                {item.icon === "Captions" && (
                  <Captions className="w-4 h-4 shrink-0" />
                )}
                {item.icon === "Instagram" && (
                  <Image
                    src="/icons/instagram.png"
                    alt="Instagram"
                    width={20}
                    height={20}
                    className="w-4 h-4 shrink-0"
                  />
                )}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
            <Separator className="w-full my-2" />
            <div className="flex items-center gap-2 py-2 font-medium text-sm">
              <MessageSquare className="w-4 h-4 shrink-0" />
              채팅 목록
            </div>
            {!isAuthenticated ? (
              <p className="text-xs text-muted-foreground py-2">
                로그인하면 채팅 기록을 불러올 수 있습니다.
              </p>
            ) : isLoading ? (
              <div className="flex items-center gap-2 py-3 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">불러오는 중...</span>
              </div>
            ) : error ? (
              <p className="text-xs text-destructive py-2">{error}</p>
            ) : conversations.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                아직 대화 기록이 없습니다.
              </p>
            ) : (
              <>
                <ul className="space-y-0.5 pb-2">
                  {conversations.map((conv) => (
                    <li key={conv.id}>
                      <DrawerClose asChild>
                        <button
                          type="button"
                          disabled={isStreaming}
                          onClick={() => onSelectConversation(conv.id)}
                          className={`w-full flex flex-col items-start gap-0.5 px-3 py-2.5 -mx-1 rounded-lg text-left transition-colors duration-150 hover:bg-accent active:bg-accent/80 disabled:opacity-50 disabled:pointer-events-none ${
                            currentConversationId === conv.id
                              ? "bg-accent/80"
                              : ""
                          }`}
                        >
                          <span className="text-sm font-medium truncate max-w-full">
                            {conv.name || "이름 없는 대화"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(conv.updated_at * 1000)}
                          </span>
                        </button>
                      </DrawerClose>
                    </li>
                  ))}
                </ul>
                {hasMore && (
                  <div className="pb-4">
                    <button
                      type="button"
                      onClick={() => void loadMore()}
                      disabled={isLoadingMore}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 transition-colors"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          불러오는 중...
                        </>
                      ) : (
                        "더 보기"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
