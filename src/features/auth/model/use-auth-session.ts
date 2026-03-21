"use client";

import { useEffect, useState } from "react";

type AuthSessionState = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
};

type AuthUser = {
  id: string;
  email: string | null;
};

type AuthSessionResponse = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  error?: string;
};

async function fetchSession(): Promise<AuthSessionResponse> {
  const response = await fetch("/api/auth/session", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("세션 정보를 불러오지 못했습니다.");
  }

  return (await response.json()) as AuthSessionResponse;
}

export function useAuthSession(): AuthSessionState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const result = await fetchSession();
        if (!isMounted) return;
        setUser(result.isAuthenticated ? result.user : null);
      } catch {
        if (!isMounted) return;
        setUser(null);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    void loadUser();

    const onFocus = () => {
      void loadUser();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadUser();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const signOut = async () => {
    const response = await fetch("/api/auth/sign-out", {
      method: "POST",
      cache: "no-store",
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      throw new Error(result?.error || "로그아웃 중 오류가 발생했습니다.");
    }

    setUser(null);
    setIsLoading(false);
  };

  return {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    signOut,
  };
}
