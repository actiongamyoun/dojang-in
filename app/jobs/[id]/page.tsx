import { notFound } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase";
import { JobDelete } from "../ui";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getServerSupabase();
  if (!supabase) notFound();

  const { data: job } = await supabase.from("jobs")
    .select("id, kind, nickname, region, emp_type, title, content, contact, created_at")
    .eq("id", id).single();
  if (!job) notFound();

  const fmt = (d: string) =>
    new Date(d).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <main>
      <article className="article">
        <div className="article-card">
          <header>
            <span className={`badge ${job.kind === "구인" ? "b-news" : "b-q"}`}>{job.kind}</span>
            <h1 style={{ fontSize: 20 }}>{job.title}</h1>
            <div className="tags" style={{ marginTop: 10 }}>
              <span className="tag">📍 {job.region}</span>
              <span className="tag">{job.emp_type}</span>
            </div>
            <div className="meta">{job.nickname} · {fmt(job.created_at)} <JobDelete id={job.id} /></div>
          </header>
          <div className="prose">
            <p style={{ whiteSpace: "pre-wrap" }}>{job.content}</p>
          </div>
          <div className="contact-box">
            <span className="ms" aria-hidden>call</span>
            <div>
              <small>연락처</small>
              <b>{job.contact}</b>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
