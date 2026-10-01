import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { siteConfig } from "@/lib/site";

// Retire the browser app before its old handlers can call Dify or Supabase.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        error: "WEB_CHAT_RETIRED",
        message: "씨앗순장과의 대화는 카카오톡에서 이어가 주세요.",
        kakao_url: siteConfig.kakaoChatUrl,
      },
      { status: 410, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: [
    "/login",
    "/onboarding",
    "/auth/:path*",
    "/api/chat/:path*",
    "/api/conversations",
    "/api/messages",
    "/api/auth/:path*",
    "/api/profile/:path*",
  ],
};
