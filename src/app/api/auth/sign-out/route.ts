import { getSupabaseEnvOrNull } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  if (!getSupabaseEnvOrNull()) {
    return Response.json({ ok: true });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
