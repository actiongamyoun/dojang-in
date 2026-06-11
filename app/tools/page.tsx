import Link from "next/link";
import fs from "fs";
import path from "path";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "검사 도구",
  description: "현장에서 바로 쓰는 도장검사 유틸리티 — 이슬점 계산기, 재도장 간격 조회. 전부 무료, 가입 불필요.",
};

type Tool = { name: string; desc: string; icon: string; color: string; url: string; status: "open" | "soon" };

function getTools(): Tool[] {
  const p = path.join(process.cwd(), "data", "tools.json");
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export default function ToolsPage() {
  const tools = getTools();

  return (
    <main>
      <div className="hero-band">
        <div className="hb-in" style={{ padding: "30px 20px" }}>
          <h1 style={{ fontSize: 26 }}>검사 도구</h1>
          <p>현장에서 바로 쓰는 도장검사 유틸리티 — 전부 무료, 가입 불필요</p>
        </div>
      </div>

      <div className="sec"><div className="sec-h"><h2>전체 도구</h2></div></div>
      <div className="appgrid">
        {tools.map((t) =>
          t.status === "open" && t.url ? (
            <a key={t.name} className="app" href={t.url} target="_blank" rel="noopener">
              <span className={`aico ${t.color} ms`}>{t.icon}</span>
              <b>{t.name}</b>
              <small>{t.desc.split("|").map((l, i) => <span key={i}>{l}<br /></span>)}</small>
              <span className="open">OPEN</span>
            </a>
          ) : (
            <span key={t.name} className="app" style={{ opacity: .65 }}>
              <span className={`aico ${t.color} ms`}>{t.icon}</span>
              <b>{t.name}</b>
              <small>{t.desc.split("|").map((l, i) => <span key={i}>{l}<br /></span>)}</small>
              <span className="open dis">준비 중</span>
            </span>
          )
        )}
      </div>

      <div className="sec"><div className="sec-h"><h2>둘러보기</h2></div></div>
      <div className="disc-row">
        <Link href="/guide" className="disc d1">
          <b>실무 지식</b>
          <small>ISO 8501 · PSPC · 결함 사례 해설</small>
        </Link>
        <Link href="/cert" className="disc d2">
          <b>자격증 가이드</b>
          <small>AMPP CIP · FROSIO 비교와 응시 전략</small>
        </Link>
      </div>
    </main>
  );
}
