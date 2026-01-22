// NOTE: 전역 폰트 및 메타데이터가 포함된 루트 레이아웃
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "씨앗 순장님과 대화하기",
  description: "TST에 등장한 AI 씨앗 순장님과 대화해보세요!",
  openGraph: {
    title: "씨앗 순장님과 대화하기",
    description: "TST에 등장한 AI 씨앗 순장님과 대화해보세요!",
    images: [
      {
        url: "https://c-at-ai.vercel.app/img/og.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
