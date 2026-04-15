"use client";

import type { Provider } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
          className="drag-none h-auto w-full max-w-[240px] object-contain select-none sm:max-w-[300px]"
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
          <span>·</span>
          <Drawer>
            <DrawerTrigger asChild>
              <button
                type="button"
                className="underline underline-offset-4 hover:text-foreground"
              >
                사업자 정보
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>사업자 정보</DrawerTitle>
              </DrawerHeader>
              <div className="space-y-1.5 px-4 pb-2 text-[13px] leading-relaxed text-muted-foreground">
                <p className="font-semibold text-foreground">
                  좋은공간 미디어 | 대표 : 윤성현
                </p>
                <p>
                  부산광역시 북구 낙동북로 772번가길 28, 지하 1층(구포동)
                </p>
                <p>
                  사업자 등록번호 : 621-14-25692{" "}
                  <a
                    href="https://www.ftc.go.kr/bizCommPop.do?wrkr_no=6211425692"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-primary underline underline-offset-4"
                  >
                    [사업자 번호 조회]
                  </a>
                </p>
                <p>통신판매번호 : 2018-부산북구-0094</p>
                <p>
                  이메일 문의 :{" "}
                  <a
                    href="mailto:ccc9020@hanmail.net"
                    className="text-primary underline underline-offset-4"
                  >
                    ccc9020@hanmail.net
                  </a>
                </p>
              </div>
              <div className="px-4 pb-6 pt-2">
                <p className="text-center text-[11px] text-muted-foreground/60">
                  &copy; {new Date().getFullYear()} 좋은공간 미디어. All rights
                  reserved.
                </p>
                <DrawerClose asChild>
                  <button
                    type="button"
                    className="mt-3 w-full rounded-xl bg-muted py-3 text-sm font-medium text-foreground"
                  >
                    닫기
                  </button>
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </div>
  );
}
