import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-[720px] text-center">
        <div className="mx-auto w-full max-w-[360px] sm:max-w-[400px]">
          <Image
            src="/img/logo.png"
            alt="씨앗 순장"
            width={449}
            height={257}
            priority
            className="h-auto w-full object-contain"
          />
        </div>

        <div className="mt-10 space-y-3">
          <p className="text-sm font-semibold tracking-[0.2em] text-muted-foreground">
            404
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            페이지를 찾을 수 없어요
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            주소가 바뀌었거나 삭제된 페이지일 수 있어요.
            <br />
            홈으로 돌아가서 다시 시작해보세요.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild className="h-11 rounded-full px-6">
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
