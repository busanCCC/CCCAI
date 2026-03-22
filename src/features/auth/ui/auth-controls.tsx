"use client";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/features/auth/model/use-auth-session";
import { useChatStore } from "@/features/chat/model/store";
import { historyQueryKeys } from "@/features/history/model/query-keys";

type AuthControlsProps = {
  onBeforeAuthAction?: () => void | Promise<void>;
};

export function AuthControls({ onBeforeAuthAction }: AuthControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, signOut } = useAuthSession();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const runBeforeAuthAction = async () => {
    await onBeforeAuthAction?.();
  };

  const handleLogin = async () => {
    const next = pathname || "/";
    await runBeforeAuthAction();
    router.push(`/login?next=${encodeURIComponent(next)}`);
  };

  const handleSignOut = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await runBeforeAuthAction();
      await signOut();
      queryClient.removeQueries({ queryKey: historyQueryKeys.all });
      useChatStore.getState().resetSession();
      toast.success("로그아웃되었습니다.");
      router.push("/");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "로그아웃 중 오류가 발생했습니다.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (!user) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void handleLogin()}
        className="rounded-2xl"
      >
        로그인
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={isSubmitting}
      className="rounded-2xl"
    >
      {isSubmitting ? "로그아웃 중..." : "로그아웃"}
    </Button>
  );
}
