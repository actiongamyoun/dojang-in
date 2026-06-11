import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  await supabase.rpc("increment_views", { p_id: id });
  return NextResponse.json({ ok: true });
}
