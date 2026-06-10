import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "실무 지식",
  description: "조선소 도장검사 실무 가이드 — 표면처리, 도장작업, 측정·검사, 결함·보수, 자격증·규격",
};

const CATS = ["전체", "표면처리", "도장작업", "측정·검사", "결함·보수", "자격증·규격"] as const;
const badgeOf: Record<string, string> = {
  표면처리: "b-tip", 도장작업: "b-q", "측정·검사": "b-news",
  "결함·보수": "b-hot", "자격증·규격": "b-notice",
};

export default async function GuideList({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const active = CATS.includes(cat as any) ? (cat as string) : "전체";
  const all = getAllPosts("guide");
  const posts = active === "전체" ? all : all.filter((p) => p.category === active);

  return (
    <main>
      <div className="chips">
        {CATS.map((c) => (
          <Link
            key={c}
            href={c === "전체" ? "/guide" : `/guide?cat=${encodeURIComponent(c)}`}
            className={`chip ${active === c ? "on" : ""}`}
          >
            {c}
          </Link>
        ))}
      </div>
      <div className="sec">
        <div className="sec-h"><h2>실무 지식</h2><span>{posts.length}편</span></div>
        <div className="feed">
          {posts.map((post) => (
            <Link key={post.slug} href={`/guide/${post.slug}`} className="post">
              <span className={`badge ${badgeOf[post.category] ?? "b-tip"}`}>{post.category}</span>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              {post.tags.length > 0 && (
                <div className="tags">
                  {post.tags.map((t) => <span key={t} className="tag">#{t}</span>)}
                </div>
              )}
              <div className="meta"><span>{post.date}</span></div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
