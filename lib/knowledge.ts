import fs from "fs";
import path from "path";
import matter from "gray-matter";

// 지식 글 본문을 모아 챗봇 컨텍스트로 제공 (경량 RAG)
export function getKnowledgeContext(): { context: string; index: { slug: string; title: string }[] } {
  const dir = path.join(process.cwd(), "content");
  if (!fs.existsSync(dir)) return { context: "", index: [] };

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  const parts: string[] = [];
  const index: { slug: string; title: string }[] = [];

  for (const f of files) {
    const slug = f.replace(/\.md$/, "");
    const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf-8"));
    index.push({ slug, title: data.title });
    // 본문은 길이 절약 위해 앞부분 중심으로 압축
    const body = content.replace(/\n{2,}/g, "\n").slice(0, 1600);
    parts.push(`### 글ID: ${slug}\n제목: ${data.title}\n분류: ${data.category}\n${body}`);
  }
  return { context: parts.join("\n\n---\n\n"), index };
}
