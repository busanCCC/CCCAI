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
    <main className="relative min-h-dvh w-full overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-linear-to-br from-amber-50/60 via-white to-cyan-50/40">
        <div className="absolute top-0 left-0 h-[520px] w-[520px] rounded-full bg-yellow-200/30 mix-blend-multiply blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[460px] w-[460px] rounded-full bg-sky-200/25 mix-blend-multiply blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-3xl">
        <OnboardingWizard initialProfile={snapshot} />
      </div>
    </main>
  );
}
