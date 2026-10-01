export const siteConfig = {
  name: "씨앗순장 | 카카오톡에서 만나는 CCC AI",
  shortName: "씨앗순장",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://ai.busanccc.com",
  description:
    "CCC와 신앙에 관한 질문, 순모임 준비와 일상의 고민까지. AI 대화 도우미 씨앗순장을 이제 카카오톡에서 만나보세요.",
  kakaoChatUrl: "https://pf.kakao.com/_xeHpxdX/chat",
  kakaoChannelUrl: "https://pf.kakao.com/_xeHpxdX",
  instagramUrl: "https://www.instagram.com/c_at_ccc/",
  ogImage: "/img/og.png",
  locale: "ko_KR",
} as const;
