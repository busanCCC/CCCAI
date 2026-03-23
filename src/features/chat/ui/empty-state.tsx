"use client";
import Image from "next/image";

export function EmptyState() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-[560px] motion-safe:animate-[fade-in_0.45s_ease-out_forwards] md:max-w-[620px]">
        <Image
          src="/img/logo.png"
          alt="씨앗 순장"
          width={449}
          height={257}
          priority
          className="drag-none h-auto w-full object-contain select-none"
        />
      </div>
    </div>
  );
}
