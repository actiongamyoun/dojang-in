import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export const dynamic = "force-dynamic";

// 글 목록 + 개별 글 원문 로드 (발행된 공개 콘텐츠라 비밀번호 불필요)
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const kind = req.nextUrl.searchParams.get("kind") === "notice" ? "notice" : "guide";
  const dir = path.join(process.cwd(), kind === "notice" ? "content-news" : "content");

  if (!slug) {
    // 목록 모드: guide + notice 전체
    const list: { slug: string; title: string; kind: string }[] = [];
    for (const [k, d] of [["guide", "content"], ["notice", "content-news"]] as const) {
      const dp = path.join(process.cwd(), d);
      if (!fs.existsSync(dp)) continue;
      for (const f of fs.readdirSync(dp).filter((f) => f.endsWith(".md"))) {
        const { data } = matter(fs.readFileSync(path.join(dp, f), "utf-8"));
        list.push({ slug: f.replace(/\.md$/, ""), title: data.title ?? f, kind: k });
      }
    }
    return NextResponse.json({ list });
  }

  // 개별 로드 모드
  const fp = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(fp)) return NextResponse.json({ error: "글 없음" }, { status: 404 });
  const raw = fs.readFileSync(fp, "utf-8");
  const { data, content } = matter(raw);
  return NextResponse.json({
    slug,
    kind,
    title: data.title ?? "",
    category: data.category ?? "",
    tags: (data.tags ?? []).join(", "),
    description: data.description ?? "",
    content: content.trim(),
  });
}
