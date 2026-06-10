import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://dojang-in.vercel.app";
  const posts = getAllPosts().map((p) => ({
    url: `${base}/guide/${p.slug}`,
    lastModified: p.date,
  }));
  const news = getAllPosts("news").map((p) => ({
    url: `${base}/news/${p.slug}`,
    lastModified: p.date,
  }));
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/guide`, lastModified: new Date() },
    { url: `${base}/tools`, lastModified: new Date() },
    { url: `${base}/news`, lastModified: new Date() },
    { url: `${base}/cert`, lastModified: new Date() },
    { url: `${base}/board`, lastModified: new Date() },
    ...posts,
    ...news,
  ];
}
