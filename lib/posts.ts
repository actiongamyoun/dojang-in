import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

export type PostMeta = {
  slug: string;
  title: string;
  category: string;
  date: string;
  description: string;
  tags: string[];
};

function dirOf(kind: "guide" | "news") {
  return path.join(process.cwd(), kind === "news" ? "content-news" : "content");
}

export function getAllPosts(kind: "guide" | "news" = "guide"): PostMeta[] {
  const dir = dirOf(kind);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  const posts = files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { data } = matter(raw);
    return {
      slug,
      title: data.title as string,
      category: data.category as string,
      date: data.date as string,
      description: data.description as string,
      tags: (data.tags as string[]) ?? [],
    };
  });
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string, kind: "guide" | "news" = "guide") {
  const raw = fs.readFileSync(path.join(dirOf(kind), `${slug}.md`), "utf-8");
  const { data, content } = matter(raw);
  const html = marked.parse(content) as string;
  return {
    slug,
    title: data.title as string,
    category: data.category as string,
    date: data.date as string,
    description: data.description as string,
    tags: (data.tags as string[]) ?? [],
    html,
  };
}
