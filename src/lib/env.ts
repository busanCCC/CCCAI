// NOTE: 서버 전용 환경 변수 검증 헬퍼

type ServerEnv = {
  DIFY_BASE_URL: string;
  DIFY_API_KEY: string;
  DIFY_GUEST_API_KEY: string | null;
};

type SupabaseEnv = {
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_DEFAULT_KEY: string;
};

function resolveSupabasePublishableKey() {
  return (
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    null
  );
}

export function getServerEnv(): ServerEnv {
  const baseUrl = process.env.DIFY_BASE_URL;
  const apiKey = process.env.DIFY_API_KEY;
  const guestApiKey = process.env.DIFY_GUEST_API_KEY ?? null;

  if (!baseUrl || !apiKey) {
    const missing = [!baseUrl ? "DIFY_BASE_URL" : null, !apiKey ? "DIFY_API_KEY" : null]
      .filter(Boolean)
      .join(", ");
    throw new Error(`Missing required server env: ${missing}`);
  }

  return {
    DIFY_BASE_URL: baseUrl,
    DIFY_API_KEY: apiKey,
    DIFY_GUEST_API_KEY: guestApiKey,
  };
}

export function getSupabaseEnv(): SupabaseEnv {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = resolveSupabasePublishableKey();

  if (!supabaseUrl || !supabasePublishableKey) {
    const missing = [
      !supabaseUrl ? "SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)" : null,
      !supabasePublishableKey
        ? "SUPABASE_PUBLISHABLE_DEFAULT_KEY (or SUPABASE_PUBLISHABLE_KEY / SUPABASE_ANON_KEY)"
        : null,
    ]
      .filter(Boolean)
      .join(", ");
    throw new Error(`Missing required Supabase env: ${missing}`);
  }

  return {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_PUBLISHABLE_DEFAULT_KEY: supabasePublishableKey,
  };
}

export function getSupabaseEnvOrNull(): SupabaseEnv | null {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = resolveSupabasePublishableKey();

  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  return {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_PUBLISHABLE_DEFAULT_KEY: supabasePublishableKey,
  };
}
