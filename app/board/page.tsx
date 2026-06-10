import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase";
import { PostForm } from "./ui";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "소통 공간",
  description: "도장검사원들의 익명 게시판 — 현장 질문, 정보 공유, 잡담 모두 환영",
};

export default async function BoardPage() {
  const supabase = getServerSupabase();
  let posts: { id: string; nickname: string; title: string; created_at: string; comment_count: number }[] = [];
  let notConfigured = false;

  if (!supabase) {
    notConfigured = true;
  } else {
    const { data } = await supabase
      .from("board_posts")
      .select("id, nickname, title, created_at, board_comments(count)")
      .order("created_at", { ascending: false })
      .limit(50);
    posts = (data ?? []).map((p: any) => ({
      ...p,
      comment_count: p.board_comments?.[0]?.count ?? 0,
    }));
  }

  return (
    <main>
      <section>
        <div className="container">
          <div className="sec-head">
            <h2>소통 공간</h2>
            <span>ANONYMOUS / BE KIND</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 18 }}>
            현장 질문, 정보 공유, 잡담 모두 환영합니다. 닉네임과 PIN만으로 익명 작성됩니다.
          </p>
          <PostForm />
          <div style={{ marginTop: 24 }}>
            {notConfigured && (
              <p style={{ fontSize: 14, color: "var(--muted)" }}>
                게시판 준비 중입니다. (Supabase 환경변수 설정 필요)
              </p>
            )}
            {!notConfigured && posts.length === 0 && (
              <p style={{ fontSize: 14, color: "var(--muted)" }}>첫 글의 주인공이 되어주세요!</p>
            )}
            {posts.map((p) => (
              <Link key={p.id} href={`/board/${p.id}`} className="row">
                <b>{p.title}{p.comment_count > 0 && <span style={{ color: "var(--blue)", marginLeft: 6 }}>[{p.comment_count}]</span>}</b>
                <span className="cat">{p.nickname} · {new Date(p.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit" })}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
