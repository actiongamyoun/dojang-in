import { getAllPosts, getPost } from "@/lib/posts";
import type { Metadata } from "next";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
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
  const post = getPost(slug);
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
