import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-background text-foreground">
      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-md flex-col px-4 py-8 sm:min-h-[calc(100dvh-8rem)] sm:py-10">
        <div className="mt-[12dvh] flex flex-col items-center gap-4 text-center sm:mt-[16dvh]">
          <Image
            src="/img/error.jpeg"
            alt="로그인 오류"
            width={84}
            height={84}
            className="rounded-full ring-2 ring-primary/30"
          />
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">로그인에 실패했습니다</h1>
            <p className="text-sm text-muted-foreground">
              잠시 후 다시 시도해 주세요. 문제가 계속되면 관리자에게 문의해주세요.
            </p>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pb-2 sm:pb-10">
          <Button asChild variant="outline" className="h-12 rounded-2xl">
            <Link href="/login">다시 로그인</Link>
          </Button>
          <Button asChild className="h-12 rounded-2xl">
            <Link href="/">홈으로 이동</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
