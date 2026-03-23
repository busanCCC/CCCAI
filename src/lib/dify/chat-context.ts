import { getServerEnv, getSupabaseEnvOrNull } from "@/lib/env";
import { createId } from "@/lib/id";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ResolvedDifyChatContext = {
  DIFY_BASE_URL: string;
  apiKey: string | null;
  user: string;
};

export async function resolveDifyChatContext(requestUser?: string | null) {
  const { DIFY_BASE_URL, DIFY_API_KEY, DIFY_GUEST_API_KEY } = getServerEnv();

  let user =
    typeof requestUser === "string" && requestUser.length > 0
      ? requestUser
      : `server_${createId()}`;
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

  const result: ResolvedDifyChatContext = {
    DIFY_BASE_URL,
    apiKey,
    user,
  };

  return result;
}
