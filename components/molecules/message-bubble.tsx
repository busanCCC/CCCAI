"use client";
// NOTE: 사용자/어시스턴트 역할 메시지 버블
import { Streamdown } from "streamdown";

import type { ChatMessage } from "@/features/chat/chat.types";
import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  message: ChatMessage;
  isStreaming?: boolean;
  processingStatus?: string | null;
};

import { AnimatePresence, motion } from "framer-motion";

export function MessageBubble({
  message,
  isStreaming,
  processingStatus,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const showProcessingStatus =
    !isUser && isStreaming && processingStatus && !message.content;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
        delay: !isUser && isStreaming ? 0.4 : 0,
      }}
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-4xl px-4 py-2 text-sm md:text-base leading-relaxed transition-all",
          isUser
            ? "bg-linear-to-br from-gray-900 to-gray-800 text-white rounded-tr-sm shadow-md"
            : "glass-panel text-foreground rounded-tl-sm",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap wrap-break-words font-medium">
            {message.content}
          </p>
        ) : (
          <div className="relative min-h-[24px]">
            <AnimatePresence mode="wait">
              {showProcessingStatus ? (
                <motion.div
                  key={processingStatus}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span>{processingStatus}</span>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Streamdown
                    className="streamdown leading-relaxed space-y-4"
                    isAnimating={Boolean(isStreaming)}
                  >
                    {message.content || " "}
                  </Streamdown>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
