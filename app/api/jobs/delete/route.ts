import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getServerSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: "서버 설정 누락" }, { status: 500 });
  const { id, pin } = await req.json();
  if (!/^\d{4}$/.test(pin ?? "")) return NextResponse.json({ error: "PIN 오류" }, { status: 400 });
  const pin_hash = createHash("sha256").update(pin).digest("hex");
  const { data } = await supabase.from("jobs").select("id").eq("id", id).eq("pin_hash", pin_hash).single();
  if (!data) return NextResponse.json({ error: "PIN이 일치하지 않습니다" }, { status: 403 });
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
