"use client";
import Image from "next/image";



export function EmptyState() {

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-6">
      <div className="w-full max-w-130 px-4">
        <Image
          src="/img/logo.png"
          alt="씨앗 순장"
          width={1600}
          height={1200}
          priority
          className="h-auto w-full object-contain"
        />
      </div>
    </div>
  );
}
