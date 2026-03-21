import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSupabaseEnvOrNull } from "@/lib/env";

export async function updateSupabaseSession(request: NextRequest) {
  const env = getSupabaseEnvOrNull();
  if (!env) {
    return NextResponse.next({
      request,
    });
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.SUPABASE_URL,
    env.SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  await supabase.auth.getUser();
  return response;
}
