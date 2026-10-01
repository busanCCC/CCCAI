import Image from "next/image";
import { ArrowUpRight, MessageCircle } from "lucide-react";

import { siteConfig } from "@/lib/site";

export function KakaoLanding() {
  return (
    <div className="flex min-h-dvh flex-col bg-white text-[#242521] selection:bg-[#fee500]">
      <main className="mx-auto grid w-full max-w-[960px] flex-1 content-center items-center justify-items-center gap-8 px-6 py-10 md:grid-cols-2 md:gap-16 md:px-10 md:py-16">
        <Image
          src="/img/seed-character.png"
          alt="머리 위에 새싹이 난 노란 씨앗순장 캐릭터"
          width={800}
          height={800}
          sizes="(max-width: 767px) 232px, 400px"
          priority
          className="aspect-square w-[min(58vw,232px)] rounded-xl object-cover md:w-full"
        />
        <section
          aria-labelledby="intro-title"
          className="w-full max-w-[360px] text-center md:text-left"
        >
          <h1
            id="intro-title"
            className="text-[42px] font-semibold leading-tight tracking-[-0.065em] md:text-[60px]"
          >
            씨앗순장
          </h1>
          <p className="mt-3 text-base text-[#65675f] md:mt-4 md:text-lg">카카오톡에서 만나요.</p>
          <a
            href={siteConfig.kakaoChatUrl}
            className="mt-8 flex min-h-14 w-full items-center justify-center gap-3 rounded-md bg-[#fee500] px-5 py-4 text-[15px] font-semibold text-[#242521] transition-colors hover:bg-[#f3da00] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#242521] md:mt-10"
          >
            <MessageCircle size={19} fill="currentColor" aria-hidden="true" />
            카카오톡에서 바로 쓰기
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </section>
      </main>
      <footer className="mx-auto flex w-full max-w-[960px] items-center justify-between px-6 pb-4 text-xs text-[#74766d] md:px-10 md:pb-6">
        <span>부산CCC · 씨앗</span>
        <a
          href={siteConfig.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1 underline-offset-4 hover:text-black hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          씨앗순장 인스타그램 <ArrowUpRight size={13} aria-hidden="true" />
        </a>
      </footer>
    </div>
  );
}
