import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseEnvOrNull } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!getSupabaseEnvOrNull()) {
    return Response.json({
      isAuthenticated: false,
      user: null,
    });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return Response.json({
        isAuthenticated: false,
        user: null,
      });
    }

    return Response.json({
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email ?? null,
      },
    });
  } catch (error) {
    return Response.json(
      {
        isAuthenticated: false,
        user: null,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
