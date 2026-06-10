import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getServerSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: "서버 설정 누락" }, { status: 500 });

  const { post_id, nickname, pin, content, website } = await req.json();
  if (website) return NextResponse.json({ ok: true });
  if (!post_id || !nickname?.trim() || !content?.trim())
    return NextResponse.json({ error: "닉네임·내용을 입력하세요" }, { status: 400 });
  if (!/^\d{4}$/.test(pin))
    return NextResponse.json({ error: "PIN은 숫자 4자리입니다" }, { status: 400 });
  if (content.length > 2000 || nickname.length > 20)
    return NextResponse.json({ error: "글자 수 제한을 초과했습니다" }, { status: 400 });

  const pin_hash = createHash("sha256").update(pin).digest("hex");
  const { error } = await supabase.from("board_comments").insert({
    post_id, nickname: nickname.trim(), pin_hash, content: content.trim(),
  });
  if (error) return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
