"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

import { createSupabaseBrowserClientOrNull } from "@/lib/supabase/client";

type AuthSessionState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
};

export function useAuthSession(): AuthSessionState {
  const supabase = createSupabaseBrowserClientOrNull();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      return;
    }
    let isMounted = true;

    const loadUser = async () => {
      const result = await supabase.auth.getUser();
      if (!isMounted) return;
      setUser(result.data.user ?? null);
      setIsLoading(false);
    };
    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    if (!supabase) {
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    signOut,
  };
}
