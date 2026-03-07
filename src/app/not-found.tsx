import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="fixed inset-0 flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-background text-foreground">
      {/* 배경 효과 */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-linear-to-br from-indigo-50/50 via-white to-yellow-50/50 pointer-events-none">
        <div className="absolute top-0 left-0 h-[400px] w-[400px] rounded-full bg-primary/10 mix-blend-multiply filter blur-[100px] animate-[float_20s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-blue-300/10 mix-blend-multiply filter blur-[100px] animate-[float-delayed_25s_ease-in-out_infinite]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center animate-fade-in">
        {/* 이미지 */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-amber-300/20 blur-3xl scale-125" />
          <Image
            src="/img/error.jpeg"
            alt="당황한 씨앗"
            width={200}
            height={200}
            className="relative w-40 h-40 md:w-48 md:h-48 rounded-3xl shadow-2xl ring-4 ring-white/50 animate-[wiggle_2s_ease-in-out_infinite]"
            priority
          />
        </div>

        {/* 404 텍스트 */}
        <div className="space-y-2">
          <h1 className="text-7xl md:text-8xl font-black bg-linear-to-r from-primary via-amber-500 to-primary bg-clip-text text-transparent">
            404
          </h1>
          <p className="text-xl md:text-2xl font-semibold text-foreground/80">
            앗! 페이지를 찾을 수 없어요
          </p>
        </div>

        {/* 설명 */}
        <p className="max-w-md text-base text-foreground/60 leading-relaxed">
          찾으시는 페이지가 사라졌거나, 주소가 잘못되었을 수 있어요.
          <br />
          <span className="text-primary font-medium">씨앗 순장</span>도 당황하고 있어요! 😅
        </p>

        {/* 홈으로 버튼 */}
        <Link
          href="/"
          className="mt-4 px-8 py-4 rounded-full bg-linear-to-r from-primary to-amber-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
        >
          씨앗과 대화하러 가기
        </Link>
      </div>

      {/* 하단 장식 */}
      <div className="absolute bottom-8 text-sm text-foreground/40">
        길을 잃었다면, 언제든 돌아와도 괜찮아요 🌱
      </div>
    </main>
  );
}
