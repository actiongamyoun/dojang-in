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

const CATS = ["전체", "질문", "정보", "잡담"] as const;
const badgeOf: Record<string, string> = { 질문: "b-q", 정보: "b-tip", 잡담: "b-etc" };

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const active = CATS.includes(cat as any) ? (cat as string) : "전체";

  const supabase = getServerSupabase();
  let posts: {
    id: string; nickname: string; title: string; content: string;
    category: string; created_at: string; views: number; likes: number; comment_count: number;
  }[] = [];
  let notConfigured = false;

  if (!supabase) {
    notConfigured = true;
  } else {
    let q = supabase
      .from("board_posts")
      .select("id, nickname, title, content, category, created_at, views, likes, board_comments(count)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (active !== "전체") q = q.eq("category", active);
    const { data } = await q;
    posts = (data ?? []).map((p: any) => ({
      ...p,
      comment_count: p.board_comments?.[0]?.count ?? 0,
    }));
  }

  return (
    <main>
      <div className="chips" style={{ maxWidth: 820 }}>
        {CATS.map((c) => (
          <Link
            key={c}
            href={c === "전체" ? "/board" : `/board?cat=${c}`}
            className={`chip ${active === c ? "on" : ""}`}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="sec board-wrap">
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
          현장 질문, 정보 공유, 잡담 모두 환영합니다. 닉네임과 PIN만으로 익명 작성됩니다.
        </p>
        <PostForm />
        <div style={{ marginTop: 18 }}>
          {notConfigured && (
            <p style={{ fontSize: 14, color: "var(--muted)" }}>
              게시판 준비 중입니다.
            </p>
          )}
          {!notConfigured && posts.length === 0 && (
            <p style={{ fontSize: 14, color: "var(--muted)" }}>첫 글의 주인공이 되어주세요!</p>
          )}
          {posts.map((p) => (
            <Link key={p.id} href={`/board/${p.id}`} className="post">
              <span className={`badge ${badgeOf[p.category] ?? "b-etc"}`}>{p.category}</span>
              <h3>{p.title}{p.comment_count > 0 && <span style={{ marginLeft: 6, fontSize: 13 }}>[{p.comment_count}]</span>}</h3>
              <p>{p.content}</p>
              <div className="meta">
                <span>{p.nickname}</span>
                <span>{new Date(p.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit" })}</span>
                <span className="meta-ic"><i className="ms">visibility</i>{p.views}</span>
                <span className="meta-ic"><i className="ms">chat_bubble</i>{p.comment_count}</span>
                <span className="meta-ic"><i className="ms">favorite</i>{p.likes}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
