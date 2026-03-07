import { redirect } from "next/navigation";

import { isProfileComplete } from "@/features/profile/model/completion";
import { toProfileSnapshot } from "@/features/profile/model/types";
import { ChatShell } from "@/features/shell/ui/chat-shell";
import { getSupabaseEnvOrNull } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// NOTE: Chat page entry point.
export const dynamic = "force-dynamic";

export default async function Page() {
  if (getSupabaseEnvOrNull()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_busan_district, role, school")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("[page] profile guard failed:", error.message);
      } else {
        const snapshot = toProfileSnapshot(profile);
        if (!isProfileComplete(snapshot)) {
          redirect("/onboarding");
        }
      }
    }
  }

  return <ChatShell />;
}
