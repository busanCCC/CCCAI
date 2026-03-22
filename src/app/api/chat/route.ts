// NOTE: 로그인 여부에 따라 Dify API 키를 분기하는 SSE 프록시 라우트
import type { NextRequest } from "next/server";

import { getServerEnv, getSupabaseEnvOrNull } from "@/lib/env";
import { createId } from "@/lib/id";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { DIFY_BASE_URL, DIFY_API_KEY, DIFY_GUEST_API_KEY } = getServerEnv();
    const body = await request.json().catch(() => null);

    if (!body || typeof body.query !== "string" || body.query.length === 0) {
      return Response.json(
        { error: "query is required" },
        {
          status: 400,
        },
      );
    }

    const conversationId = typeof body.conversation_id === "string" ? body.conversation_id : "";
    let user =
      typeof body.user === "string" && body.user.length > 0 ? body.user : `server_${createId()}`;
    let apiKey = DIFY_GUEST_API_KEY;

    if (getSupabaseEnvOrNull()) {
      try {
        const supabase = await createSupabaseServerClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser?.id) {
          user = authUser.id;
          apiKey = DIFY_API_KEY;
        }
      } catch {
        // 세션 조회 실패 시 비로그인 요청으로 처리합니다.
      }
    }

    if (!apiKey) {
      return Response.json(
        { error: "Missing required server env: DIFY_GUEST_API_KEY" },
        { status: 500 },
      );
    }

    const difyResponse = await fetch(`${DIFY_BASE_URL}/chat-messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {},
        query: body.query,
        response_mode: "streaming",
        conversation_id: conversationId ?? "",
        user,
      }),
    });

    if (!difyResponse.ok || !difyResponse.body) {
      const errorText = await difyResponse.text().catch(() => "");
      return Response.json(
        {
          error: "Dify request failed",
          details: errorText,
        },
        { status: difyResponse.status },
      );
    }

    return new Response(difyResponse.body, {
      status: difyResponse.status,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Server error",
      },
      { status: 500 },
    );
  }
}
