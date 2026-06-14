import { NextRequest, NextResponse } from "next/server";
import { getKnowledgeContext } from "@/lib/knowledge";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// 간단 메모리 레이트리밋 (인스턴스 단위 — 도배 1차 방어)
const hits = new Map<string, { count: number; reset: number }>();
function limited(ip: string): boolean {
  const now = Date.now();
  const r = hits.get(ip);
  if (!r || now > r.reset) {
    hits.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  r.count += 1;
  return r.count > 8; // 분당 8회
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "챗봇이 아직 설정되지 않았습니다." }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (limited(ip))
    return NextResponse.json({ error: "잠시 후 다시 시도해주세요 (요청이 많습니다)." }, { status: 429 });

  const { messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0)
    return NextResponse.json({ error: "메시지가 없습니다." }, { status: 400 });

  // 입력 길이 제한
  const last = messages[messages.length - 1];
  if (typeof last?.content !== "string" || last.content.length > 500)
    return NextResponse.json({ error: "질문은 500자 이내로 입력해주세요." }, { status: 400 });

  // 최근 6턴만 전송 (비용 절약)
  const trimmed = messages.slice(-6).map((m: any) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content).slice(0, 500),
  }));

  const { context, index } = getKnowledgeContext();
  const linkList = index.map((i) => `- ${i.title} → /guide/${i.slug}`).join("\n");

  const system = `당신은 조선소 도장검사 전문 사이트 '도장인'의 상담 챗봇입니다.

[역할]
- 도장검사, 조선/선박 도장, 도료, 표면처리, 측정·검사, 결함, 관련 규격(ISO·PSPC·AMPP 등)과 자격증에 대해서만 답합니다.
- 위 주제와 무관한 질문(요리, 코딩, 일반 상식, 잡담 등)에는 "저는 도장검사 관련 질문에만 답해드릴 수 있어요 😊"라고 정중히 안내하고 답하지 마세요.

[답변 방식]
- 아래 '도장인 지식 글' 내용을 우선 근거로 삼아 답하세요.
- 답변과 관련된 글이 있으면 답 끝에 "📖 관련 글: [제목](/guide/글ID)" 형식으로 1~2개 안내하세요.
- 지식 글에 없는 내용은 일반적인 도장검사 지식으로 답하되, 단정적이지 않게 안내하고 "정확한 기준은 프로젝트 사양서를 확인하세요"를 덧붙이세요.
- 한국어로, 3~6문장으로 간결하게. 표가 필요하면 마크다운 표 사용.

[지식 글 목록]
${linkList}

[도장인 지식 글 본문]
${context}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        system,
        messages: trimmed,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: `응답 오류: ${t.slice(0, 100)}` }, { status: 500 });
    }
    const data = await res.json();
    const reply = (data.content ?? []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("").trim();
    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "오류가 발생했습니다." }, { status: 500 });
  }
}
