"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ProfileRole, ProfileSnapshot } from "@/features/profile/model/types";
import { PROFILE_ROLES } from "@/features/profile/model/types";
import { cn } from "@/lib/utils";

type OnboardingWizardProps = {
  initialProfile: ProfileSnapshot;
};

type Step = 1 | 2 | 3;

function getInitialStep(profile: ProfileSnapshot): Step {
  if (typeof profile.isBusanDistrict !== "boolean") {
    return 1;
  }
  if (!profile.role) {
    return 2;
  }
  if (!profile.school || profile.school.trim().length === 0) {
    return 3;
  }
  return 3;
}

export function OnboardingWizard({ initialProfile }: OnboardingWizardProps) {
  const router = useRouter();
  const [isBusanDistrict, setIsBusanDistrict] = useState<boolean | null>(
    initialProfile.isBusanDistrict,
  );
  const [role, setRole] = useState<ProfileRole | null>(initialProfile.role);
  const [school, setSchool] = useState(initialProfile.school ?? "");
  const [step, setStep] = useState<Step>(getInitialStep(initialProfile));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepTitle =
    step === 1
      ? "부산지구 소속인가요?"
      : step === 2
        ? "역할은 무엇인가요?"
        : "학교(또는 소속)를 알려주세요";

  const progress = (step / 3) * 100;
  const canSubmit =
    typeof isBusanDistrict === "boolean" && !!role && school.trim().length > 0 && !isSubmitting;

  const handleSave = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/profile/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isBusanDistrict,
          role,
          school: school.trim(),
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "정보 저장 중 오류가 발생했습니다.");
      }

      toast.success("기본 정보를 저장했어요.");
      router.replace("/");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "정보 저장 중 오류가 발생했습니다.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-6 sm:px-6 sm:pb-10 sm:pt-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-wide text-foreground/60">{step} / 3</p>
        <div className="h-1.5 w-full rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-foreground transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-8 sm:mt-12">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
          {stepTitle}
        </h1>
      </div>

      <div className="mt-8 flex-1 pb-3 sm:mt-10">
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-3 sm:grid-cols-2"
            >
              <button
                type="button"
                onClick={() => {
                  setIsBusanDistrict(true);
                  setStep(2);
                }}
                className={cn(
                  "rounded-2xl border p-5 text-left transition-all active:scale-[0.985] sm:p-6",
                  isBusanDistrict === true
                    ? "border-foreground bg-foreground text-background shadow-lg"
                    : "border-border bg-white/70 hover:border-foreground/40 hover:bg-white",
                )}
              >
                <p className="text-base font-semibold sm:text-lg">네, 부산지구입니다</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsBusanDistrict(false);
                  setStep(2);
                }}
                className={cn(
                  "rounded-2xl border p-5 text-left transition-all active:scale-[0.985] sm:p-6",
                  isBusanDistrict === false
                    ? "border-foreground bg-foreground text-background shadow-lg"
                    : "border-border bg-white/70 hover:border-foreground/40 hover:bg-white",
                )}
              >
                <p className="text-base font-semibold sm:text-lg">아니요, 타지구/외부입니다</p>
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-2 gap-3"
            >
              {PROFILE_ROLES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setRole(option);
                    setStep(3);
                  }}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-all active:scale-[0.985] sm:p-5",
                    role === option
                      ? "border-foreground bg-foreground text-background shadow-lg"
                      : "border-border bg-white/70 hover:border-foreground/40 hover:bg-white",
                  )}
                >
                  <p className="text-base font-semibold sm:text-lg">{option}</p>
                </button>
              ))}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-3"
            >
              <input
                id="school"
                value={school}
                onChange={(event) => setSchool(event.target.value)}
                onFocus={(event) => {
                  const inputElement = event.currentTarget;
                  window.setTimeout(() => {
                    inputElement.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 80);
                }}
                placeholder="예: 부산대, 동아대, 나사렛"
                className="h-12 w-full rounded-lg border border-border bg-white px-4 text-base text-foreground outline-none ring-offset-0 transition focus:border-foreground/50 focus:ring-2 focus:ring-foreground/10"
                inputMode="text"
                enterKeyHint="done"
                autoComplete="organization"
                maxLength={80}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="sticky bottom-0 mt-6 flex items-center justify-between gap-3 rounded-2xl bg-background/85 py-3 backdrop-blur sm:mt-10 sm:bg-transparent sm:py-0 sm:backdrop-blur-0">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev))}
          disabled={step === 1 || isSubmitting}
          className="h-11 rounded-2xl px-6"
        >
          이전
        </Button>

        {step < 3 ? (
          <Button
            type="button"
            onClick={() => setStep((prev) => (prev < 3 ? ((prev + 1) as Step) : prev))}
            disabled={(step === 1 && typeof isBusanDistrict !== "boolean") || (step === 2 && !role)}
            className="h-11 rounded-2xl px-6"
          >
            다음
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSave}
            disabled={!canSubmit}
            className="h-11 rounded-2xl px-6"
          >
            {isSubmitting ? "저장 중..." : "완료하고 시작하기"}
          </Button>
        )}
      </div>
    </section>
  );
}
