import { getAllPosts, getPost } from "@/lib/posts";
import type { Metadata } from "next";

export function generateStaticParams() {
  return getAllPosts("guide").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug, "guide");
  return {
    title: post.title,
    description: post.description,
    openGraph: { title: post.title, description: post.description, type: "article" },
  };
}

export default async function GuidePost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug, "guide");
  return (
    <main>
      <article className="article">
        <div className="article-card">
          <header>
            <span className="badge b-tip">{post.category}</span>
            <h1>{post.title}</h1>
            <div className="meta">{post.date}</div>
          </header>
          <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
        </div>
      </article>
    </main>
  );
}
