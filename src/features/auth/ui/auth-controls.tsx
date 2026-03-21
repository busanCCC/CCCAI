"use client";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/features/auth/model/use-auth-session";
import { useChatStore } from "@/features/chat/model/store";
import { historyQueryKeys } from "@/features/history/model/query-keys";

type AuthControlsProps = {
  disabled?: boolean;
};

export function AuthControls({ disabled }: AuthControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, signOut } = useAuthSession();
  const queryClient = useQueryClient();

  const handleLogin = () => {
    const next = pathname || "/";
    router.push(`/login?next=${encodeURIComponent(next)}`);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      queryClient.removeQueries({ queryKey: historyQueryKeys.all });
      useChatStore.getState().resetSession();
      toast.success("로그아웃되었습니다.");
      router.push("/");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "로그아웃 중 오류가 발생했습니다.";
      toast.error(message);
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
        onClick={handleLogin}
        disabled={disabled}
        className="rounded-full"
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
      disabled={disabled}
      className="rounded-full"
    >
      로그아웃
    </Button>
  );
}
