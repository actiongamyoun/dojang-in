import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TYPE_GUIDE: Record<string, string> = {
  defect:
    "이 사진은 도막 또는 강재 표면의 결함으로 추정됩니다. 결함명(핀홀/블리스터/크레터링/오렌지필/세깅/러스트 등) 후보를 제시하고, 가능한 원인과 현장 조치를 설명하는 글을 작성하세요. 단정이 어려우면 가능성을 복수로 제시하고 추가 확인 방법을 안내하세요.",
  measure:
    "이 사진은 측정기 또는 측정 장면으로 추정됩니다. 어떤 장비/측정인지 식별하고(DFT 게이지, 조도 비교판, 염분 측정 키트 등), 올바른 사용법과 규격(ISO 등) 기준, 자주 하는 실수를 설명하는 글을 작성하세요.",
  paint:
    "이 사진은 도료 제품 또는 도장 상태로 추정됩니다. 관련 도료 종류와 특성, 검사 포인트를 설명하는 글을 작성하세요.",
  general:
    "이 사진을 보고 조선소 도장검사 관점에서 가장 유용한 실무 지식 글을 작성하세요. 사진에서 식별 가능한 것에 근거하되, 과도한 추측은 피하세요.",
  news:
    "이 사진과 관련된 주제로 글을 작성하되, 함께 제공되는 최신 웹 검색 정보를 반영해 시의성 있는 내용으로 작성하세요.",
};

const CATS = ["표면처리", "도장작업", "도료", "측정·검사", "결함·보수", "자격증·규격"];

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const adminPw = process.env.ADMIN_PASSWORD;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY 미설정" }, { status: 500 });

  const { password, imageBase64, mediaType, type, hint, useSearch } = await req.json();
  if (adminPw && password !== adminPw)
    return NextResponse.json({ error: "비밀번호 불일치" }, { status: 401 });
  if (!imageBase64) return NextResponse.json({ error: "이미지가 없습니다" }, { status: 400 });

  const guide = TYPE_GUIDE[type] ?? TYPE_GUIDE.general;
  const hintLine = hint?.trim() ? `\n작성자 메모(참고): ${hint.trim()}` : "";

  const sys = `당신은 조선소 도장검사 전문 매거진 '도장인'의 에디터입니다.
첨부된 사진을 분석해 실무 지식 글의 초안을 작성합니다.

규칙:
- 한국어로, 현장 검사원이 읽기 쉬운 실무 톤으로 작성
- 사진에서 확실히 보이는 것과 추정을 구분해서 서술 (단정 금지)
- 본문은 마크다운: ## 소제목, 표, 목록 활용. 1000~1800자 분량
- 글 끝에 "*이 글은 사진 분석 기반 초안입니다. 발행 전 현장 전문가의 검수가 필요합니다.*" 한 줄 추가
- category는 다음 중 하나만: ${CATS.join(", ")}
- 아래 JSON만 출력. 마크다운 백틱·다른 텍스트 금지:
{"title":"제목","category":"카테고리","tags":["태그1","태그2","태그3"],"description":"검색·목록 노출용 1~2문장","content":"마크다운 본문"}`;

  const userContent: any[] = [
    { type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: imageBase64 } },
    { type: "text", text: `${guide}${hintLine}` },
  ];

  const bodyReq: any = {
    model: "claude-sonnet-4-6",
    max_tokens: 2500,
    system: sys,
    messages: [{ role: "user", content: userContent }],
  };
  if (useSearch) {
    bodyReq.tools = [{ type: "web_search_20250305", name: "web_search" }];
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(bodyReq),
    });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: `API ${res.status}: ${t.slice(0, 150)}` }, { status: 500 });
    }
    const data = await res.json();
    const text = (data.content ?? [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    let draft;
    try {
      draft = JSON.parse(text);
    } catch {
      // JSON 파싱 실패 시 본문만이라도 반환
      return NextResponse.json({
        title: "", category: "결함·보수", tags: [],
        description: "", content: text,
      });
    }
    if (!CATS.includes(draft.category)) draft.category = "결함·보수";
    draft.tags = Array.isArray(draft.tags) ? draft.tags : [];
    return NextResponse.json(draft);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "분석 실패" }, { status: 500 });
  }
}
