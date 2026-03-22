"use client";

import type { Provider } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/features/auth/model/use-auth-session";
import { cn } from "@/lib/utils";

const PROVIDERS: Array<{
  key: Provider;
  label: string;
  className: string;
  iconSrc: string;
  iconAlt: string;
}> = [
  {
    key: "kakao",
    label: "카카오 계정으로 로그인",
    className:
      "bg-[#FEE500] text-[#191919] border-[#FEE500] hover:bg-[#f9df00] active:bg-[#edd500]",
    iconSrc: "/icons/kakao-login-symbol.svg",
    iconAlt: "Kakao",
  },
];

export function LoginPanel() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { isAuthenticated, isLoading } = useAuthSession();
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(next);
    }
  }, [isAuthenticated, isLoading, next, router]);

  const handleSignIn = async (provider: Provider) => {
    setLoadingProvider(provider);
    try {
      const signInPath = `/api/auth/sign-in?provider=${encodeURIComponent(provider)}&next=${encodeURIComponent(next)}`;
      window.location.assign(signInPath);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "로그인 요청 중 오류가 발생했습니다.";
      toast.error(message);
      setLoadingProvider(null);
    }
  };

  if (!isLoading && isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100dvh-2.5rem)] flex-col py-8 sm:min-h-[calc(100dvh-8rem)] sm:py-10">
      <div className="mt-[11dvh] flex flex-col items-center text-center sm:mt-[14dvh]">
        <Image
          src="/img/logo.png"
          alt="씨앗 순장"
          width={449}
          height={257}
          className="h-auto w-full max-w-[240px] object-contain sm:max-w-[300px]"
        />
      </div>

      <div className="mt-auto flex flex-col gap-3 pb-2 sm:pb-10">
        {PROVIDERS.map((provider) => (
          <Button
            key={provider.key}
            type="button"
            variant="outline"
            size="lg"
            onClick={() => handleSignIn(provider.key)}
            disabled={Boolean(loadingProvider)}
            className={cn(
              "h-14 w-full justify-center gap-3 rounded-[20px] border text-base font-semibold md:h-16 md:text-lg",
              provider.className,
            )}
          >
            <Image src={provider.iconSrc} alt={provider.iconAlt} width={22} height={22} />
            <span>{loadingProvider === provider.key ? "연결 중..." : provider.label}</span>
          </Button>
        ))}

        <div className="pt-4 flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <Link
            href="https://devung.notion.site/318132a2dc1b807ea3defef6717c9164"
            target="_blank"
            rel="noreferrer noopener"
            className="underline underline-offset-4 hover:text-foreground"
          >
            개인정보처리방침
          </Link>
          <span>·</span>
          <Link
            href="https://devung.notion.site/318132a2dc1b80e2a3b3f4fc3be475fa"
            target="_blank"
            rel="noreferrer noopener"
            className="underline underline-offset-4 hover:text-foreground"
          >
            이용약관
          </Link>
        </div>
      </div>
    </div>
  );
}
