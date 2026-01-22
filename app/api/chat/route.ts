//NOTE: SSE proxy route for Dify Chat API.
import { NextRequest } from "next/server";

import { getServerEnv } from "@/lib/env";
import { createId } from "@/lib/id";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { DIFY_BASE_URL, DIFY_API_KEY } = getServerEnv();
    const body = await request.json().catch(() => null);

    if (!body || typeof body.query !== "string" || body.query.length === 0) {
      return Response.json(
        { error: "query is required" },
        {
          status: 400,
        }
      );
    }

    const conversationId =
      typeof body.conversation_id === "string" ? body.conversation_id : "";
    const user =
      typeof body.user === "string" && body.user.length > 0
        ? body.user
        : `server_${createId()}`;

    const difyResponse = await fetch(`${DIFY_BASE_URL}/chat-messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
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
        { status: difyResponse.status }
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
      { status: 500 }
    );
  }
}
