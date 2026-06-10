import { notFound } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase";
import { CommentForm, DeleteButton } from "../ui";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getServerSupabase();
  if (!supabase) notFound();

  const { data: post } = await supabase
    .from("board_posts")
    .select("id, nickname, title, content, created_at")
    .eq("id", id)
    .single();
  if (!post) notFound();

  const { data: comments } = await supabase
    .from("board_comments")
    .select("id, nickname, content, created_at")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  const fmt = (d: string) =>
    new Date(d).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <main>
      <article className="article">
        <div className="container">
          <header>
            <h1 style={{ fontSize: 24 }}>{post.title}</h1>
            <div className="meta">
              {post.nickname} · {fmt(post.created_at)} <DeleteButton type="post" id={post.id} />
            </div>
          </header>
          <div className="prose">
            <p style={{ whiteSpace: "pre-wrap" }}>{post.content}</p>
          </div>

          <div className="sec-head" style={{ marginTop: 40 }}>
            <h2>댓글 {comments?.length ?? 0}</h2>
          </div>
          {(comments ?? []).map((c) => (
            <div key={c.id} className="comment">
              <div className="comment-meta">
                <b>{c.nickname}</b> · {fmt(c.created_at)} <DeleteButton type="comment" id={c.id} />
              </div>
              <p style={{ whiteSpace: "pre-wrap", fontSize: 15 }}>{c.content}</p>
            </div>
          ))}
          <div style={{ marginTop: 20 }}>
            <CommentForm postId={post.id} />
          </div>
        </div>
      </article>
    </main>
  );
}
