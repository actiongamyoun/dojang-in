import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase";
import { JobForm } from "./ui";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "구인·구직",
  description: "조선소 도장검사 구인·구직 — 검사원 채용, 일자리 정보를 나누는 공간",
};

const TABS = ["전체", "구인", "구직"] as const;

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const active = TABS.includes(kind as any) ? (kind as string) : "전체";

  const supabase = getServerSupabase();
  let jobs: any[] = [];
  let notConfigured = false;

  if (!supabase) notConfigured = true;
  else {
    let q = supabase.from("jobs")
      .select("id, kind, nickname, region, emp_type, title, created_at")
      .order("created_at", { ascending: false }).limit(60);
    if (active !== "전체") q = q.eq("kind", active);
    const { data } = await q;
    jobs = data ?? [];
  }

  return (
    <main>
      <div className="chips" style={{ maxWidth: 820 }}>
        {TABS.map((t) => (
          <Link key={t} href={t === "전체" ? "/jobs" : `/jobs?kind=${t}`} className={`chip ${active === t ? "on" : ""}`}>{t}</Link>
        ))}
      </div>

      <div className="sec board-wrap">
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
          조선소 도장검사 구인·구직 정보입니다. 연락처를 남겨 직접 소통하세요. 익명 PIN으로 작성됩니다.
        </p>
        <JobForm />
        <div style={{ marginTop: 18 }}>
          {notConfigured && <p style={{ fontSize: 14, color: "var(--muted)" }}>구인·구직 게시판 준비 중입니다.</p>}
          {!notConfigured && jobs.length === 0 && <p style={{ fontSize: 14, color: "var(--muted)" }}>첫 공고를 등록해보세요!</p>}
          {jobs.map((j) => (
            <Link key={j.id} href={`/jobs/${j.id}`} className="post">
              <span className={`badge ${j.kind === "구인" ? "b-news" : "b-q"}`}>{j.kind}</span>
              <h3>{j.title}</h3>
              <div className="tags">
                <span className="tag">📍 {j.region}</span>
                <span className="tag">{j.emp_type}</span>
              </div>
              <div className="meta">
                <span>{j.nickname}</span>
                <span>{new Date(j.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit" })}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
