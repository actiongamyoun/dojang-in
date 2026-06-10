import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

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

      <Link href="/cert" className="disc d2" style={{ marginBottom: 18 }}>
        <b>자격증 가이드</b>
        <small>AMPP CIP · FROSIO 레벨 체계와 응시 전략</small>
      </Link>

      <Link href="/board" className="fab">✏️ 글쓰기</Link>
    </main>
  );
}
