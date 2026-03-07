import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator";
import { Menu, House, Captions } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
    {
        label: "홈",
        icon: "House",
        link: "/",
    },
    {
        label: "목요채플 요약",
        icon: "Captions",
        link: "/captions",
    },
    {
        label: "인스타그램",
        icon: "Instagram",
        link: "https://www.instagram.com/c_at_ccc",
    }
]


export function ChatDrawer() {
  return (
    <div className="flex flex-wrap gap-2">
        <Drawer
          direction="left"
        >
          <DrawerTrigger asChild>
            <button className="p-2 rounded-lg transition-colors duration-150 hover:bg-accent active:bg-accent/80 active:scale-[0.95] transform">
              <Menu className="w-5 h-5" />
            </button>
          </DrawerTrigger>
          <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[50vh] data-[vaul-drawer-direction=top]:max-h-[50vh]">
            <DrawerHeader>
              <DrawerTitle className="text-2xl font-black tracking-tight text-amber-500">씨앗 순장</DrawerTitle>
              <DrawerDescription>
                씨앗 순장에게서 다양한 정보를 받아보세요.
              </DrawerDescription>
            </DrawerHeader>
            <div className="no-scrollbar overflow-y-auto px-4">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.link}
                  className="flex items-center gap-3 px-3 py-2.5 -mx-1 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-accent active:bg-accent/80 active:scale-[0.98] transform"
                >
                  {item.icon === "House" && <House className="w-4 h-4 shrink-0" />}
                  {item.icon === "Captions" && <Captions className="w-4 h-4 shrink-0" />}
                  {item.icon === "Instagram" && <Image src="/icons/instagram.png" alt="Instagram" width={20} height={20} className="w-4 h-4 shrink-0" />}
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
              <Separator className="w-full my-2" />
              <div className="flex items-center gap-2 py-2">
                채팅 목록
              </div>
            </div>
          </DrawerContent>
        </Drawer>
    </div>
  )
}
