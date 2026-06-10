import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import VisitorStats from "./components/VisitorStats";
import ProfileSurvey from "./components/ProfileSurvey";

export default function Home() {
  const guides = getAllPosts("guide");
  const news = getAllPosts("news");
  const feed = [
    ...guides.map((p) => ({ ...p, kind: "guide" as const })),
    ...news.map((p) => ({ ...p, kind: "news" as const })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));
  const weekly = guides.slice(0, 3);

  return (
    <main>
      <div className="hero-band">
        <div className="hb-in">
          <h1>도장검사, 기준이 있는 곳</h1>
          <p>검사 도구 · 규격 해설 · 결함 사례 · 검사원 커뮤니티. 조선소 도장 QC 실무 경험으로 만든 도장검사원의 허브입니다.</p>
          <div className="hero-cta">
            <Link href="/tools">도구 사용하기</Link>
            <Link href="/guide" className="ghost">실무 지식 보기</Link>
          </div>
        </div>
      </div>

      <div className="sec" style={{ paddingBottom: 0 }}>
        <VisitorStats />
        <ProfileSurvey />
      </div>

      <div className="quick">
        <Link href="/tools"><span className="ico q1">🧰</span>도구</Link>
        <Link href="/guide"><span className="ico q2">📘</span>지식</Link>
        <Link href="/news"><span className="ico q3">📰</span>새소식</Link>
        <Link href="/board"><span className="ico q4">💬</span>소통</Link>
      </div>

      <div className="sec">
        <div className="sec-h"><h2>이번 주 인기</h2><Link href="/guide">더보기 ›</Link></div>
        <div className="hscroll">
          {weekly.map((p) => (
            <Link key={p.slug} href={`/guide/${p.slug}`} className="mini">
              <span className="badge b-tip">{p.category}</span>
              <b>{p.title}</b>
              <p>{p.description}</p>
              <div className="meta">{p.date}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="sec">
        <div className="sec-h"><h2>최신 글</h2><Link href="/guide">전체보기 ›</Link></div>
        <div className="feed">
          {feed.slice(0, 6).map((p) => (
            <Link key={`${p.kind}-${p.slug}`} href={`/${p.kind}/${p.slug}`} className="post">
              <span className={`badge ${p.kind === "news" ? "b-news" : "b-q"}`}>
                {p.kind === "news" ? "새소식" : "지식"}
              </span>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <div className="meta"><span>{p.category}</span><span>{p.date}</span></div>
            </Link>
          ))}
        </div>
      </div>

      <div className="disc-row">
        <Link href="/cert" className="disc d2">
          <b>자격증 가이드</b>
          <small>AMPP CIP · FROSIO 레벨 체계와 응시 전략</small>
        </Link>
        <Link href="/board" className="disc d1">
          <b>소통 공간</b>
          <small>현장 질문 · 정보 공유 — 익명으로 편하게</small>
        </Link>
      </div>

      <Link href="/board" className="fab">✏️ 글쓰기</Link>
    </main>
  );
}
