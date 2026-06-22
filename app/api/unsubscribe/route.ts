import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";

// 메일 하단 링크: /api/unsubscribe?token=xxx
export async function GET(req: NextRequest) {
  const supabase = getServerSupabase();
  const token = req.nextUrl.searchParams.get("token");
  if (!supabase || !token)
    return new NextResponse("잘못된 요청입니다.", { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } });

  await supabase.from("subscribers").delete().eq("token", token);
  return new NextResponse(
    `<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
     <body style="font-family:sans-serif;text-align:center;padding:60px 20px;color:#16212e">
       <h2 style="color:#0d5ba8">구독이 해지되었습니다</h2>
       <p style="color:#64748b">도장인 뉴스레터 발송을 중단했습니다. 언제든 다시 구독하실 수 있어요.</p>
       <a href="https://dojang-in.vercel.app" style="color:#0d5ba8">도장인으로 돌아가기</a>
     </body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
