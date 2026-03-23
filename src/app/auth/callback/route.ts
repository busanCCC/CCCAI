import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isProfileComplete } from "@/features/profile/model/completion";
import { toProfileSnapshot } from "@/features/profile/model/types";
import { getAppUrl } from "@/lib/app-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const AUTH_NEXT_COOKIE = "cccai-auth-next";

function pickString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function withClearedAuthNextCookie(response: NextResponse) {
  response.cookies.set(AUTH_NEXT_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function GET(request: NextRequest) {
  const appUrl = getAppUrl(request);
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = request.cookies.get(AUTH_NEXT_COOKIE)?.value || requestUrl.searchParams.get("next") || "/";
  const safeNext = next.startsWith("/") ? next : "/";

  if (!code) {
    return withClearedAuthNextCookie(NextResponse.redirect(new URL("/auth/error", appUrl)));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return withClearedAuthNextCookie(NextResponse.redirect(new URL("/auth/error", appUrl)));
    }

    // NOTE: 로그인 직후 서비스용 profiles 행을 생성/갱신한다.
    let shouldOnboard = false;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const metadata = user.user_metadata as Record<string, unknown> | undefined;
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            email: user.email ?? null,
            full_name: pickString(metadata?.full_name),
            avatar_url: pickString(metadata?.avatar_url),
          },
          { onConflict: "user_id" },
        )
        .select("is_busan_district, role, school")
        .single();

      if (profileError) {
        // NOTE: profiles 미생성 상태에서도 로그인은 계속 진행한다.
        console.error("[auth/callback] profiles upsert failed:", profileError.message);
      } else {
        shouldOnboard = !isProfileComplete(toProfileSnapshot(profile));
      }
    }

    return withClearedAuthNextCookie(
      NextResponse.redirect(new URL(shouldOnboard ? "/onboarding" : safeNext, appUrl)),
    );
  } catch {
    return withClearedAuthNextCookie(NextResponse.redirect(new URL("/auth/error", appUrl)));
  }
}
