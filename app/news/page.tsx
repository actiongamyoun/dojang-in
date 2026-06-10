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
      <section>
        <div className="container">
          <div className="sec-head">
            <h2>새소식</h2>
            <span>{posts.length} POSTS</span>
          </div>
          {posts.map((post) => (
            <Link key={post.slug} href={`/news/${post.slug}`} className="row">
              <b>{post.title}</b>
              <span className="cat">{post.category} · {post.date}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
