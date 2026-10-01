import type { Metadata } from "next";

import { KakaoLanding } from "@/features/landing/ui/kakao-landing";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: siteConfig.name },
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default function Page() {
  return <KakaoLanding />;
}
