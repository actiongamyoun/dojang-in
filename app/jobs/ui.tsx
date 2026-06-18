"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EMP = ["정규직", "계약직", "일용", "협의"];

export function JobForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd)),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setMsg(data.error ?? "오류가 발생했습니다"); return; }
    setOpen(false);
    router.refresh();
  }

  if (!open)
    return <button className="btn" onClick={() => setOpen(true)}>✏️ 구인·구직 등록</button>;

  return (
    <form onSubmit={submit} className="board-form">
      <div className="form-row">
        <select name="kind" defaultValue="구인">
          <option value="구인">구인 (사람 구함)</option>
          <option value="구직">구직 (일자리 구함)</option>
        </select>
        <select name="emp_type" defaultValue="정규직">
          {EMP.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>
      <div className="form-row">
        <input name="region" placeholder="지역 (예: 울산, 거제, 영암)" maxLength={40} required />
        <input name="nickname" placeholder="닉네임/업체명" maxLength={20} required />
      </div>
      <input name="title" placeholder="제목 (예: 도장검사원 모집 / 경력 10년 검사원 구직)" maxLength={100} required />
      <textarea name="content" placeholder="상세 내용 — 자격요건, 급여, 근무조건, 경력 등" rows={6} maxLength={3000} required />
      <div className="form-row">
        <input name="contact" placeholder="연락처 (전화/이메일/카톡 ID) — 필수" maxLength={100} required />
        <input name="pin" placeholder="PIN 4자리 (삭제용)" inputMode="numeric" pattern="\d{4}" maxLength={4} required style={{ maxWidth: 140 }} />
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px" }} aria-hidden="true" />
      {msg && <p className="form-msg">{msg}</p>}
      <div className="form-row">
        <button className="btn" disabled={busy}>{busy ? "등록 중…" : "등록"}</button>
        <button type="button" className="btn ghost" onClick={() => setOpen(false)}>취소</button>
      </div>
    </form>
  );
}

export function JobDelete({ id }: { id: string }) {
  const router = useRouter();
  async function del() {
    const pin = prompt("작성 시 입력한 PIN 4자리를 입력하세요");
    if (!pin) return;
    const res = await fetch("/api/jobs/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, pin }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error ?? "삭제 실패"); return; }
    router.push("/jobs");
  }
  return <button onClick={del} className="del-btn">삭제</button>;
}
