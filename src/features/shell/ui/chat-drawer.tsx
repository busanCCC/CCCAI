"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { useConversationHistory } from "@/features/history/model/use-conversation-history";
import { Menu, House, Captions, MessageSquare, Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const menuItems = [
  { label: "홈", icon: "House", link: "/" },
  { label: "목요채플 요약", icon: "Captions", link: "/captions" },
  {
    label: "씨앗순장 인스타그램",
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
  authUserId: string | null;
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
};

export function ChatDrawer({
  isAuthenticated,
  authUserId,
  currentConversationId,
  onSelectConversation,
}: ChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    conversations,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
  } = useConversationHistory({
    enabled: isOpen,
    userId: authUserId,
  });

  return (
    <div className="flex flex-wrap gap-2">
      <Drawer direction="left" open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <button
            className="p-2 rounded-lg transition-colors duration-150 hover:bg-accent active:bg-accent/80 active:scale-[0.95] transform"
            aria-label="메뉴 열기"
          >
            <Menu className="w-5 h-5" />
          </button>
        </DrawerTrigger>
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[50vh] data-[vaul-drawer-direction=top]:max-h-[50vh]">
          <DrawerHeader className="flex-row items-start justify-between gap-3 pb-4">
            <DrawerTitle className="sr-only">메뉴</DrawerTitle>
            <div className="w-full max-w-[110px] pt-1">
              <Image
                src="/img/logo.png"
                alt="씨앗 순장"
                width={449}
                height={257}
                className="h-auto w-full object-contain"
              />
            </div>
            <DrawerClose asChild>
              <button
                type="button"
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="메뉴 닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </DrawerClose>
          </DrawerHeader>
          <div className="flex min-h-0 flex-1 flex-col px-4 pt-1">
            <div className="space-y-1.5">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.link}
                  className="flex items-center gap-3 px-3 py-3 -mx-1 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-accent active:bg-accent/80 active:scale-[0.98] transform"
                >
                  {item.icon === "House" && <House className="w-4 h-4 shrink-0" />}
                  {item.icon === "Captions" && (
                    <Captions className="w-4 h-4 shrink-0" />
                  )}
                  {item.icon === "Instagram" && (
                    <Image
                      src="/icons/Instagram.png"
                      alt="Instagram"
                      width={20}
                      height={20}
                      className="w-4 h-4 shrink-0"
                    />
                  )}
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
            <Separator className="w-full my-4" />
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center gap-2 px-2 py-2 font-medium text-sm">
                <MessageSquare className="w-4 h-4 shrink-0" />
                채팅 목록
              </div>
              <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
                {!isAuthenticated ? (
                  <p className="px-2 py-2 text-xs text-muted-foreground">
                    로그인하면 채팅 기록을 불러올 수 있습니다.
                  </p>
                ) : isLoading ? (
                  <div className="flex items-center gap-2 px-2 py-3 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">불러오는 중...</span>
                  </div>
                ) : error ? (
                  <p className="px-2 py-2 text-xs text-destructive">{error}</p>
                ) : conversations.length === 0 ? (
                  <p className="px-2 py-2 text-xs text-muted-foreground">
                    아직 대화 기록이 없습니다.
                  </p>
                ) : (
                  <>
                    <ul className="space-y-0.5 px-2 pb-2">
                      {conversations.map((conv) => (
                        <li key={conv.id}>
                          <DrawerClose asChild>
                            <button
                              type="button"
                              onClick={() => onSelectConversation(conv.id)}
                              className={`w-full flex flex-col items-start gap-0.5 px-3 py-2.5 -mx-1 rounded-lg text-left transition-colors duration-150 hover:bg-accent active:bg-accent/80 ${
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
                      <div className="px-2 pb-4">
                        <button
                          type="button"
                          onClick={() => void loadMore()}
                          disabled={isLoadingMore}
                          className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
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
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
