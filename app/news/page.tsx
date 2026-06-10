import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "새소식",
  description: "도장·조선 업계 새소식 — 규격 개정, 도료 기술, 업계 동향",
};

export default function NewsList() {
  const posts = getAllPosts("news");
  return (
    <main>
      <div className="sec">
        <div className="sec-h"><h2>새소식</h2><span style={{ fontSize: 12, color: "var(--muted)" }}>{posts.length}건</span></div>
        <div className="feed">
        {posts.map((post) => (
          <Link key={post.slug} href={`/news/${post.slug}`} className="post">
            <span className="badge b-news">{post.category}</span>
            <h3>{post.title}</h3>
            <p>{post.description}</p>
            <div className="meta"><span>{post.date}</span></div>
          </Link>
        ))}
        </div>
      </div>
    </main>
  );
}
