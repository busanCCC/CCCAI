// NOTE: 서버 전용 환경 변수 검증 헬퍼

type ServerEnv = {
  DIFY_BASE_URL: string;
  DIFY_API_KEY: string;
};

type SupabaseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: string;
};

function resolveSupabasePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    null
  );
}

export function getServerEnv(): ServerEnv {
  const baseUrl = process.env.DIFY_BASE_URL;
  const apiKey = process.env.DIFY_API_KEY;

  if (!baseUrl || !apiKey) {
    const missing = [!baseUrl ? "DIFY_BASE_URL" : null, !apiKey ? "DIFY_API_KEY" : null]
      .filter(Boolean)
      .join(", ");
    throw new Error(`Missing required server env: ${missing}`);
  }

  return {
    DIFY_BASE_URL: baseUrl,
    DIFY_API_KEY: apiKey,
  };
}

export function getSupabaseEnv(): SupabaseEnv {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = resolveSupabasePublishableKey();

  if (!supabaseUrl || !supabasePublishableKey) {
    const missing = [
      !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : null,
      !supabasePublishableKey
        ? "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)"
        : null,
    ]
      .filter(Boolean)
      .join(", ");
    throw new Error(`Missing required Supabase env: ${missing}`);
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: supabasePublishableKey,
  };
}

export function getSupabaseEnvOrNull(): SupabaseEnv | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = resolveSupabasePublishableKey();

  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: supabasePublishableKey,
  };
}
