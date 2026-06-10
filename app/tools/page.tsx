import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "검사 도구",
  description: "현장에서 바로 쓰는 도장검사 유틸리티 — 이슬점 계산기, 재도장 간격 조회. 전부 무료, 가입 불필요.",
};

export default function ToolsPage() {
  return (
    <main>
      <div className="hero-band">
        <h1>검사 도구</h1>
        <p>현장에서 바로 쓰는 도장검사 유틸리티 — 전부 무료, 가입 불필요</p>
      </div>

      <div className="sec"><div className="sec-h"><h2>전체 도구</h2></div></div>
      <div className="appgrid">
        <a className="app" href="https://humidity-dew.vercel.app" target="_blank" rel="noopener">
          <span className="aico a1">💧</span>
          <b>이슬점 계산기</b>
          <small>노점·ΔT3<br />도장 가능 판정</small>
          <span className="open">OPEN</span>
        </a>
        <a className="app" href="https://paint-recoating-immersion.netlify.app" target="_blank" rel="noopener">
          <span className="aico a2">⏱️</span>
          <b>재도장 간격</b>
          <small>6개 메이커<br />TDS 조회</small>
          <span className="open">OPEN</span>
        </a>
        <span className="app" style={{ opacity: .65 }}>
          <span className="aico a3">📏</span>
          <b>DFT 통계</b>
          <small>ISO 19840<br />90/10 자동 판정</small>
          <span className="open dis">준비 중</span>
        </span>
        <span className="app" style={{ opacity: .65 }}>
          <span className="aico a4">🪣</span>
          <b>도료 소요량</b>
          <small>면적·로스율<br />소요량 계산</small>
          <span className="open dis">준비 중</span>
        </span>
      </div>

      <div className="sec"><div className="sec-h"><h2>둘러보기</h2></div></div>
      <Link href="/guide" className="disc d1">
        <b>실무 지식</b>
        <small>ISO 8501 · PSPC · 결함 사례 해설</small>
      </Link>
      <Link href="/cert" className="disc d2">
        <b>자격증 가이드</b>
        <small>AMPP CIP · FROSIO 비교와 응시 전략</small>
      </Link>
    </main>
  );
}
