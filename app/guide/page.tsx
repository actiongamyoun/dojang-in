import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "실무 지식",
  description: "조선소 도장검사 실무 가이드 — ISO 8501 표면처리, PSPC, 도막 결함 사례 해설",
};

export default function GuideList() {
  const posts = getAllPosts("guide");
  return (
    <main>
      <div className="sec">
        <div className="sec-h"><h2>실무 지식</h2><span style={{ fontSize: 12, color: "var(--muted)" }}>{posts.length}편</span></div>
        {posts.map((post) => (
          <Link key={post.slug} href={`/guide/${post.slug}`} className="post">
            <span className="badge b-tip">{post.category}</span>
            <h3>{post.title}</h3>
            <p>{post.description}</p>
            <div className="meta"><span>{post.date}</span></div>
          </Link>
        ))}
      </div>
    </main>
  );
}
