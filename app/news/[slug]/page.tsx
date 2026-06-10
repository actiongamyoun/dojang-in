import { getAllPosts, getPost } from "@/lib/posts";
import type { Metadata } from "next";

export function generateStaticParams() {
  return getAllPosts("news").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug, "news");
  return { title: post.title, description: post.description };
}

export default async function NewsPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug, "news");
  return (
    <main>
      <article className="article">
        <div className="container">
          <header>
            <h1>{post.title}</h1>
            <div className="meta">{post.category} · {post.date}</div>
          </header>
          <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
        </div>
      </article>
    </main>
  );
}
