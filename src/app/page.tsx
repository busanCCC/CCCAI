import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { isProfileComplete } from "@/features/profile/model/completion";
import { toProfileSnapshot } from "@/features/profile/model/types";
import { ChatShell } from "@/features/shell/ui/chat-shell";
import { getSupabaseEnvOrNull } from "@/lib/env";
import { siteConfig } from "@/lib/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// NOTE: Chat page entry point.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "CCC AI 씨앗 순장 | TST·새생활·성경·CCC 질문 도우미",
  },
  description:
    "CCC AI 씨앗 순장과 TST, 새생활, 성경, CCC 관련 질문을 빠르게 묻고 답변받아보세요.",
  keywords: [
    "CCC",
    "씨앗 순장",
    "AI 챗봇",
    "TST",
    "새생활",
    "성경",
    "순모임",
    "캠퍼스 사역",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    url: "/",
    title: "CCC AI 씨앗 순장 | TST·새생활·성경·CCC 질문 도우미",
    description:
      "CCC AI 씨앗 순장과 TST, 새생활, 성경, CCC 관련 질문을 빠르게 묻고 답변받아보세요.",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "CCC AI 씨앗 순장 메인 화면",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CCC AI 씨앗 순장 | TST·새생활·성경·CCC 질문 도우미",
    description:
      "CCC AI 씨앗 순장과 TST, 새생활, 성경, CCC 관련 질문을 빠르게 묻고 답변받아보세요.",
    images: [siteConfig.ogImage],
  },
};

export default async function Page() {
  if (getSupabaseEnvOrNull()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_busan_district, role, school")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("[page] profile guard failed:", error.message);
      } else {
        const snapshot = toProfileSnapshot(profile);
        if (!isProfileComplete(snapshot)) {
          redirect("/onboarding");
        }
      }
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        inLanguage: "ko-KR",
      },
      {
        "@type": "WebApplication",
        "@id": `${siteConfig.url}/#app`,
        name: siteConfig.name,
        url: siteConfig.url,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        inLanguage: "ko-KR",
        description:
          "CCC AI 씨앗 순장과 TST, 새생활, 성경, CCC 관련 질문을 빠르게 묻고 답변받을 수 있는 웹 서비스",
        isAccessibleForFree: true,
        image: `${siteConfig.url}${siteConfig.ogImage}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ChatShell />
    </>
  );
}
