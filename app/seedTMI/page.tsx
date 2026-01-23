"use client";
import { SeedPopover } from "@/components/molecules/seed-popover";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import type { DotLottie } from "@lottiefiles/dotlottie-react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SECTIONS } from "@/features/TMI";
// 전체 섹션 수: 히어로(0) + 콘텐츠(1~5) + 아웃트로(6)
const TOTAL_SECTIONS = SECTIONS.length + 2;

export default function SeedTMI() {
  const [activeSection, setActiveSection] = useState(0);
  const [loadedLotties, setLoadedLotties] = useState<Set<number>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const isAllLottiesLoaded = loadedLotties.size === SECTIONS.length;

  const handleLottieLoad = useCallback((index: number) => {
    setLoadedLotties((prev) => new Set(prev).add(index));
  }, []);

  const createLottieRefCallback = useCallback(
    (index: number) => (dotLottie: DotLottie | null) => {
      if (dotLottie) {
        dotLottie.addEventListener("load", () => {
          handleLottieLoad(index);
        });
      }
    },
    [handleLottieLoad]
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionRefs.current.indexOf(entry.target as HTMLElement);
            if (index !== -1) {
              setActiveSection(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (index: number) => {
    const section = sectionRefs.current[index];
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const router = useRouter();

  return (
    <main className="fixed inset-0 flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground supports-[height:100cqh]:h-[100cqh] supports-[height:100svh]:h-svh">
      {/* 로딩 오버레이 */}
      {!isAllLottiesLoaded && (
        <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-500">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl scale-150 animate-pulse" />
              <Spinner className="relative size-12 text-primary" />
            </div>
            <p className="text-sm text-foreground/60 animate-pulse">
              씨앗 순장의 정보를 불러오는 중...
            </p>
            <div className="flex gap-1.5 mt-2">
              {SECTIONS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    loadedLotties.has(index)
                      ? "bg-primary scale-110"
                      : "bg-foreground/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 오로라 배경 */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-linear-to-br from-indigo-50/50 via-white to-yellow-50/50 pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 h-[200%] w-[200%] animate-[aurora_60s_linear_infinite] opacity-60 bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] mix-blend-overlay filter blur-[100px] will-change-transform" />
        <div className="absolute top-0 left-0 h-[600px] w-[600px] rounded-full bg-primary/20 mix-blend-multiply filter blur-[120px] animate-[float_20s_ease-in-out_infinite] will-change-transform" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-300/20 mix-blend-multiply filter blur-[120px] animate-[float-delayed_25s_ease-in-out_infinite] will-change-transform" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-yellow-200/10 mix-blend-overlay filter blur-[100px] will-change-transform" />
      </div>

      {/* 고정 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-0">
        <div className="mx-auto max-w-[600px] flex items-center justify-between">
          <SeedPopover />
          <Button type="button"
        variant="outline"
        onClick={() => router.push("/")}>
            씨앗과 대화하기
          </Button>
        </div>
      </header>

      {/* 고정 섹션 인디케이터 */}
      <nav className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {Array.from({ length: TOTAL_SECTIONS }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className="group relative flex items-center justify-end"
            aria-label={`섹션 ${index + 1}로 이동`}
          >
            {/* 툴팁 */}
            <span className="absolute right-6 px-2 py-1 rounded-md bg-foreground/80 text-background text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {index === 0 ? "소개" : index === TOTAL_SECTIONS - 1 ? "마무리" : `TMI ${index}`}
            </span>
            {/* 도트 */}
            <span
              className={`block rounded-full transition-all duration-300 ${
                activeSection === index
                  ? "w-3 h-3 bg-primary shadow-lg shadow-primary/50"
                  : "w-2 h-2 bg-foreground/30 hover:bg-foreground/50"
              }`}
            />
          </button>
        ))}
      </nav>

      {/* 스냅 스크롤 컨테이너 */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 h-full w-full overflow-y-auto scroll-smooth snap-y snap-mandatory"
      >
        {/* 히어로 섹션 */}
        <section
          ref={(el) => { sectionRefs.current[0] = el; }}
          className="relative flex min-h-dvh snap-start snap-always flex-col items-center justify-center px-4"
        >
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-3xl scale-150" />
              <Image
                src="/img/씨앗original.png"
                alt="씨앗ai"
                width={200}
                height={200}
                className="relative w-48 h-48 md:w-56 md:h-56 rounded-full shadow-2xl ring-4 ring-white/50 animate-[float_6s_ease-in-out_infinite]"
              />
            </div>
            <div className="text-center space-y-3 animate-slide-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
              <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-primary via-amber-500 to-primary bg-clip-text text-transparent">
                안녕!
              </h1>
              <p className="text-xl md:text-2xl text-foreground/80">
                난 <span className="font-bold text-primary">씨앗 순장</span>이야!
              </p>
              <p className="text-lg md:text-xl text-foreground/60">
                너랑 많은 <span className="font-semibold">대화</span>를 나누고 싶어!
              </p>
            </div>
          </div>
          
          {/* 스크롤 인디케이터 */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-sm text-foreground/50">스크롤하여 더 알아보기</span>
            <ChevronDown className="w-6 h-6 text-primary/60" />
          </div>
        </section>

        {/* 콘텐츠 섹션들 */}
        {SECTIONS.map((section, index) => (
          <section
            key={index}
            ref={(el) => { sectionRefs.current[index + 1] = el; }}
            className="relative flex min-h-dvh snap-start snap-always items-center justify-center px-4 py-20"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 max-w-[800px] mx-auto">
              {/* Lottie 애니메이션 */}
              <div 
                className={`relative shrink-0 ${index % 2 === 1 ? "md:order-2" : ""}`}
              >
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-125" />
                <div className="relative w-48 h-48 md:w-64 md:h-64">
                  <DotLottieReact
                    src={section.lottie}
                    autoplay
                    loop
                    className="w-full h-full drop-shadow-2xl"
                    dotLottieRefCallback={createLottieRefCallback(index)}
                  />
                </div>
              </div>

              {/* 텍스트 콘텐츠 */}
              <div 
                className={`relative flex-1 ${index % 2 === 1 ? "md:order-1 md:text-right" : "md:text-left"}`}
              >
                <div className="relative overflow-hidden rounded-3xl backdrop-blur-md bg-white/40 dark:bg-black/20 p-6 md:p-8 shadow-xl ring-1 ring-white/50">
                  {/* 장식용 그라데이션 */}
                  <div 
                    className={`absolute top-0 ${index % 2 === 1 ? "right-0 bg-linear-to-l" : "left-0 bg-linear-to-r"} w-1 h-full from-primary to-amber-400`}
                  />
                  
                  <div className="space-y-3 ">
                    {section.content.map((text, textIndex) => (
                      <p
                        key={textIndex}
                        className={`text-base md:text-lg leading-relaxed text-foreground/80 ${
                          text.startsWith("→") || text.startsWith('"') 
                            ? "text-primary font-medium pl-4 border-l-2 border-primary/30 font-bold" 
                            : ""
                        }`}
                      >
                        {text}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* 아웃트로 섹션 */}
        <section
          ref={(el) => { sectionRefs.current[TOTAL_SECTIONS - 1] = el; }}
          className="relative flex min-h-dvh snap-start snap-always flex-col items-center justify-center px-4 pb-20"
        >
          <div className="flex flex-col items-center gap-8 max-w-[500px] text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-linear-to-br from-primary/40 to-amber-300/40 blur-3xl scale-150" />
              <Image
                src="/img/씨앗ai.png"
                alt="씨앗ai"
                width={150}
                height={150}
                className="relative w-32 h-32 rounded-full shadow-2xl ring-4 ring-white/50 animate-[float_6s_ease-in-out_infinite]"
              />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground/90">
                함께해줘서 고마워!
              </h2>
              <p className="text-lg text-foreground/60">
                언제든 대화하고 싶을 때 찾아와 줘
              </p>
            </div>

            <Link 
              href="/"
              className="mt-4 px-8 py-4 rounded-full bg-linear-to-r from-primary to-amber-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
            >
              씨앗과 대화하기
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
