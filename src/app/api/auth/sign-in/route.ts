import type { Provider } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getAppUrl } from "@/lib/app-url";
import { getSupabaseEnvOrNull } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_PROVIDERS: Provider[] = ["kakao"];

function getSafeNext(value: string | null) {
  return value && value.startsWith("/") ? value : "/";
}

export async function GET(request: NextRequest) {
  const appUrl = getAppUrl(request);

  if (!getSupabaseEnvOrNull()) {
    return NextResponse.redirect(new URL("/auth/error", appUrl));
  }

  const requestUrl = new URL(request.url);
  const provider = requestUrl.searchParams.get("provider");
  const safeNext = getSafeNext(requestUrl.searchParams.get("next"));

  if (!provider || !ALLOWED_PROVIDERS.includes(provider as Provider)) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(safeNext)}`, appUrl));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const redirectTo = `${appUrl}/auth/callback?next=${encodeURIComponent(safeNext)}`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo,
      },
    });

    if (error || !data.url) {
      return NextResponse.redirect(new URL("/auth/error", appUrl));
    }

    return NextResponse.redirect(data.url);
  } catch {
    return NextResponse.redirect(new URL("/auth/error", appUrl));
  }
}
