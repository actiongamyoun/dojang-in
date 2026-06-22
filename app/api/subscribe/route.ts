import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServerSupabase } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: "서버 설정 누락" }, { status: 500 });

  const { email, website } = await req.json();
  if (website) return NextResponse.json({ ok: true }); // honeypot
  if (!email || !EMAIL_RE.test(email) || email.length > 120)
    return NextResponse.json({ error: "올바른 이메일을 입력하세요" }, { status: 400 });

  const token = randomUUID();
  const { error } = await supabase
    .from("subscribers")
    .upsert({ email: email.toLowerCase().trim(), token, confirmed: true }, { onConflict: "email" });
  if (error) return NextResponse.json({ error: "구독 처리 실패" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
