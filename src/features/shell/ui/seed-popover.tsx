"use client";

import Image from "next/image";

export function SeedPopover() {
  return (
    <div className="flex items-center gap-2">
      <div className="object-cover w-10 h-10 items-center justify-center flex rounded-2xl glass-panel shadow-lg ring-1 ring-white/40">
        <Image src="/img/씨앗ai.png" alt="씨앗ai" width={80} height={80} className="rounded-full" />
      </div>
      <h1 className="text-lg font-semibold tracking-tight text-foreground/90">씨앗 순장</h1>
    </div>
  );
}
