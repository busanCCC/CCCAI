"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv, getSupabaseEnvOrNull } from "@/lib/env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY } =
    getSupabaseEnv();
  browserClient = createBrowserClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  );
  return browserClient;
}

export function createSupabaseBrowserClientOrNull() {
  const env = getSupabaseEnvOrNull();
  if (!env) {
    return null;
  }
  return createSupabaseBrowserClient();
}
