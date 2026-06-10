import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function kstTodayStart(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 3600 * 1000);
  kst.setUTCHours(0, 0, 0, 0);
  return new Date(kst.getTime() - 9 * 3600 * 1000).toISOString();
}

export async function POST() {
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false });
  await supabase.from("visits").insert({});
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ enabled: false });

  const [{ count: total }, { count: today }] = await Promise.all([
    supabase.from("visits").select("*", { count: "exact", head: true }),
    supabase.from("visits").select("*", { count: "exact", head: true }).gte("created_at", kstTodayStart()),
  ]);
  return NextResponse.json({ enabled: true, total: total ?? 0, today: today ?? 0 });
}
