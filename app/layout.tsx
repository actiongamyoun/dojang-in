import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import TabBar from "./components/TabBar";
import TopNav from "./components/TopNav";
import ChatBot from "./components/ChatBot";
import MobileMenu from "./components/MobileMenu";
import LangToggle from "./components/LangToggle";
import "./globals.css";

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL("https://dojang-in.vercel.app"),
  title: {
    default: "도장인 — 조선소 도장검사 허브",
    template: "%s | 도장인",
  },
  description:
    "조선소 도장검사 도구·실무 지식·커뮤니티. 이슬점 계산기, 재도장 간격 조회, ISO 8501·PSPC 규격 해설, 도막 결함 사례까지 무료로 제공합니다.",
  keywords: [
    "도장검사", "도장검사원", "조선소 도장", "이슬점 계산", "DFT",
    "PSPC", "ISO 8501", "표면처리", "재도장 간격", "도막 결함",
  ],
  openGraph: {
    title: "도장인 — 조선소 도장검사 허브",
    description: "검사 도구는 무료로 쓰고, 실무 지식은 같이 나누는 도장검사원의 공간",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0..1,0&display=block"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="topbar">
          <div className="in">
            <div className="topbar-left">
              <MobileMenu />
              <Link href="/" className="logo-link" aria-label="도장인 홈">
                <Image src="/images/logo.png" alt="도장인" width={38} height={38} priority />
                <span className="logo-text">도장인</span>
              </Link>
            </div>
            <div className="topbar-right">
              <TopNav />
              <LangToggle />
            </div>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          도장인 — 조선소 도장검사 허브 · 도구는 모두 무료입니다
        </footer>
        <TabBar />
        <ChatBot />
      </body>
    </html>
  );
}
