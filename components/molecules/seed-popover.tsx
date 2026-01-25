import Image from "next/image"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

export function SeedPopover() {
  return (
    <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger
            render={
              <button className="object-cover w-10 h-10 items-center justify-center flex rounded-2xl glass-panel shadow-lg ring-1 ring-white/40 cursor-pointer transition-transform hover:scale-105 active:scale-95">
                <Image
                  src="/img/씨앗ai.png"
                  alt="씨앗ai"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </button>
            }
          />
          <PopoverContent align="start" sideOffset={8} className="flex flex-col p-4 w-64">
            <PopoverHeader>
              <PopoverTitle className="text-lg font-bold">씨앗 순장</PopoverTitle>
            </PopoverHeader>
            
            <div className="flex items-center justify-center py-3">
              <Image
                src="/img/씨앗ai.png"
                alt="씨앗ai"
                width={120}
                height={120}
                className="rounded-full"
              />
            </div>
            
            <ul className="text-sm space-y-1 text-foreground/80">
              <li>• 이름: 씨앗 (C-at)</li>
              <li>• 직분: 순장</li>
              <li>• MBTI: ENFP</li>
            </ul>
            
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs text-foreground/60">씨앗 순장님에 대해 더 알고 싶다면?</p>
              <a href="/seedTMI" className="text-sm text-yellow-500 font-bold underline hover:text-yellow-400">
                씨앗 순장의 TMI →
              </a>
            </div>
          </PopoverContent>
        </Popover>
        <h1 className="text-lg font-semibold tracking-tight text-foreground/90">
          씨앗 순장
        </h1>
      </div>
  )
}
