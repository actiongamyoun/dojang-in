import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GH_API = "https://api.github.com";

function env() {
  return {
    password: process.env.ADMIN_PASSWORD,
    token: process.env.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPO, // 예: actiongamyoun/dojang-in
  };
}

async function ghGetSha(repo: string, token: string, filePath: string): Promise<string | null> {
  const res = await fetch(`${GH_API}/repos/${repo}/contents/${filePath}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.sha ?? null;
}

async function ghPut(repo: string, token: string, filePath: string, content: string, message: string) {
  const sha = await ghGetSha(repo, token, filePath);
  const res = await fetch(`${GH_API}/repos/${repo}/contents/${filePath}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf-8").toString("base64"),
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub API ${res.status}: ${err.slice(0, 200)}`);
  }
}

function buildMd(p: {
  title: string; category: string; tags: string[]; description: string; body: string; date: string;
}): string {
  const tagLine = p.tags.length
    ? `tags: [${p.tags.map((t) => `"${t}"`).join(", ")}]\n`
    : "";
  return `---
title: "${p.title.replace(/"/g, "'")}"
category: "${p.category}"
${tagLine}date: "${p.date}"
description: "${p.description.replace(/"/g, "'")}"
---

${p.body.trim()}
`;
}

export async function POST(req: NextRequest) {
  const { password, token, repo } = env();
  if (!password || !token || !repo)
    return NextResponse.json({ error: "서버 환경변수 미설정 (ADMIN_PASSWORD / GITHUB_TOKEN / GITHUB_REPO)" }, { status: 500 });

  const body = await req.json();
  if (body.password !== password)
    return NextResponse.json({ error: "비밀번호가 일치하지 않습니다" }, { status: 401 });

  const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

  try {
    if (body.type === "guide" || body.type === "notice") {
      const { slug, title, category, tags, description, content } = body;
      if (!slug || !/^[a-z0-9-]+$/.test(slug))
        return NextResponse.json({ error: "slug는 영문 소문자·숫자·하이픈만 가능합니다" }, { status: 400 });
      if (!title?.trim() || !description?.trim() || !content?.trim())
        return NextResponse.json({ error: "제목·설명·본문을 입력하세요" }, { status: 400 });

      const dir = body.type === "guide" ? "content" : "content-news";
      const cat = body.type === "notice" ? "공지" : category;
      const md = buildMd({
        title: title.trim(),
        category: cat,
        tags: Array.isArray(tags) ? tags : [],
        description: description.trim(),
        body: content,
        date: today,
      });
      await ghPut(repo, token, `${dir}/${slug}.md`, md, `📝 관리자 등록: ${title.trim()}`);
      return NextResponse.json({ ok: true, path: `${dir}/${slug}.md` });
    }

    if (body.type === "tools") {
      const tools = body.tools;
      if (!Array.isArray(tools) || tools.length === 0)
        return NextResponse.json({ error: "도구 목록이 비어 있습니다" }, { status: 400 });
      for (const t of tools) {
        if (!t.name?.trim() || !t.icon?.trim() || !["open", "soon"].includes(t.status))
          return NextResponse.json({ error: `도구 항목 형식 오류: ${t.name ?? "(이름 없음)"}` }, { status: 400 });
      }
      const json = JSON.stringify(tools, null, 2);
      await ghPut(repo, token, "data/tools.json", json, "🧰 관리자: 도구 목록 업데이트");
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "알 수 없는 type" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "발행 실패" }, { status: 500 });
  }
}
