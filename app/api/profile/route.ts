import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const AGES = ["20대", "30대", "40대", "50대 이상"];
const INDUSTRIES = ["조선소", "플랜트", "건축·강구조", "도료·자재", "학생·취준", "기타"];

export async function POST(req: NextRequest) {
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false }, { status: 500 });

  const { age_group, industry } = await req.json();
  if (!AGES.includes(age_group) || !INDUSTRIES.includes(industry))
    return NextResponse.json({ error: "잘못된 값" }, { status: 400 });

  await supabase.from("visitor_profiles").insert({ age_group, industry });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ enabled: false });

  const { data } = await supabase.from("visitor_profiles").select("age_group, industry");
  const rows = data ?? [];
  const count = (key: "age_group" | "industry") =>
    rows.reduce<Record<string, number>>((acc, r: any) => {
      acc[r[key]] = (acc[r[key]] ?? 0) + 1;
      return acc;
    }, {});
  return NextResponse.json({ enabled: true, total: rows.length, age: count("age_group"), industry: count("industry") });
}
