import { redirect } from "next/navigation";

import { isProfileComplete } from "@/features/profile/model/completion";
import { toProfileSnapshot } from "@/features/profile/model/types";
import { OnboardingWizard } from "@/features/profile/ui/onboarding-wizard";
import { getSupabaseEnvOrNull } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  if (!getSupabaseEnvOrNull()) {
    redirect("/login?next=/onboarding");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_busan_district, role, school")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[onboarding] failed to read profile:", error.message);
  }

  const snapshot = toProfileSnapshot(error ? null : profile);
  if (isProfileComplete(snapshot)) {
    redirect("/");
  }

  return (
    <main className="desktop-page-backdrop relative min-h-dvh w-full overflow-hidden bg-background text-foreground">
      <div className="desktop-page-surface relative z-10 mx-auto flex min-h-dvh w-full max-w-3xl">
        <OnboardingWizard initialProfile={snapshot} />
      </div>
    </main>
  );
}
