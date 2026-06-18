import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getServerSupabase } from "@/lib/supabase";

const KINDS = ["구인", "구직"];
const EMP = ["정규직", "계약직", "일용", "협의"];

export async function POST(req: NextRequest) {
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: "서버 설정 누락" }, { status: 500 });

  const { kind, nickname, pin, region, emp_type, title, content, contact, website } = await req.json();
  if (website) return NextResponse.json({ ok: true }); // honeypot

  if (!nickname?.trim() || !region?.trim() || !title?.trim() || !content?.trim() || !contact?.trim())
    return NextResponse.json({ error: "닉네임·지역·제목·내용·연락처를 모두 입력하세요" }, { status: 400 });
  if (!/^\d{4}$/.test(pin))
    return NextResponse.json({ error: "PIN은 숫자 4자리입니다" }, { status: 400 });
  if (title.length > 100 || content.length > 3000 || contact.length > 100)
    return NextResponse.json({ error: "글자 수 제한을 초과했습니다" }, { status: 400 });

  const k = KINDS.includes(kind) ? kind : "구인";
  const et = EMP.includes(emp_type) ? emp_type : "협의";
  const pin_hash = createHash("sha256").update(pin).digest("hex");

  const { error } = await supabase.from("jobs").insert({
    kind: k, nickname: nickname.trim(), pin_hash, region: region.trim(),
    emp_type: et, title: title.trim(), content: content.trim(), contact: contact.trim(),
  });
  if (error) return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
