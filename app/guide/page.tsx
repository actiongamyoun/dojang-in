import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "실무 지식",
  description: "조선소 도장검사 실무 가이드 — ISO 8501 표면처리, PSPC, 도막 결함 사례 해설",
};

export default function GuideList() {
  const posts = getAllPosts();
  return (
    <main>
      <section>
        <div className="container">
          <div className="sec-head">
            <h2>실무 지식</h2>
            <span>{posts.length} ARTICLES</span>
          </div>
          {posts.map((post) => (
            <Link key={post.slug} href={`/guide/${post.slug}`} className="row">
              <b>{post.title}</b>
              <span className="cat">{post.category}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
