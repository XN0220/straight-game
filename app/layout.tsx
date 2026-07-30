import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://xn0220.github.io"),
  title: "직진 게임 · 지구 연구실과 7개 행성 240개 맵",
  description: "충분히 생각하며 푸는 턴 기반 직진 퍼즐. 7개 행성에서 기믹을 하나씩 익혀보세요!",
  alternates: {
    canonical: "/straight-game/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://xn0220.github.io/straight-game/",
    siteName: "직진 게임",
    title: "직진 게임",
    description: "멈추지 마세요. 목표는 하나! 지구에서 훈련하고 우주를 탐사하세요.",
    images: [
      {
        url: "https://xn0220.github.io/straight-game/social-preview.jpg",
        width: 1731,
        height: 909,
        alt: "우주 퍼즐 맵과 직진하는 픽셀 캐릭터가 그려진 직진 게임",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "직진 게임",
    description: "멈추지 마세요. 목표는 하나! 지구에서 훈련하고 우주를 탐사하세요.",
    images: ["https://xn0220.github.io/straight-game/social-preview.jpg"],
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
