import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getServerSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: "서버 설정 누락" }, { status: 500 });

  const body = await req.json();
  const { nickname, pin, title, content, website } = body;

  // honeypot — 봇이 채우는 숨은 필드
  if (website) return NextResponse.json({ ok: true });

  if (!nickname?.trim() || !title?.trim() || !content?.trim())
    return NextResponse.json({ error: "닉네임·제목·내용을 입력하세요" }, { status: 400 });
  if (!/^\d{4}$/.test(pin))
    return NextResponse.json({ error: "PIN은 숫자 4자리입니다" }, { status: 400 });
  if (title.length > 100 || content.length > 5000 || nickname.length > 20)
    return NextResponse.json({ error: "글자 수 제한을 초과했습니다" }, { status: 400 });

  const pin_hash = createHash("sha256").update(pin).digest("hex");
  const { error } = await supabase.from("board_posts").insert({
    nickname: nickname.trim(), pin_hash, title: title.trim(), content: content.trim(),
  });
  if (error) return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
