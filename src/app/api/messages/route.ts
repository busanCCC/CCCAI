// NOTE: DIFY 대화 메시지 히스토리 API 프록시 (인증 필수)
import type { NextRequest } from "next/server";

import { getServerEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversation_id");
    if (!conversationId || conversationId.length === 0) {
      return Response.json(
        { error: "conversation_id is required" },
        { status: 400 },
      );
    }

    const { DIFY_BASE_URL, DIFY_API_KEY } = getServerEnv();
    const firstId = searchParams.get("first_id") ?? undefined;
    const limit = searchParams.get("limit") ?? "20";

    const url = new URL(`${DIFY_BASE_URL}/messages`);
    url.searchParams.set("conversation_id", conversationId);
    url.searchParams.set("user", user.id);
    if (firstId) url.searchParams.set("first_id", firstId);
    url.searchParams.set("limit", limit);

    const difyResponse = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text().catch(() => "");
      return Response.json(
        { error: "Dify request failed", details: errorText },
        { status: difyResponse.status },
      );
    }

    const data = await difyResponse.json();
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
