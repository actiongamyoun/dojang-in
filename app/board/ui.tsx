"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PostForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/board", {
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
    return <button className="cta" onClick={() => setOpen(true)} style={{ border: 0, cursor: "pointer" }}>글쓰기</button>;

  return (
    <form onSubmit={submit} className="board-form">
      <div className="form-row">
        <input name="nickname" placeholder="닉네임" maxLength={20} required />
        <input name="pin" placeholder="PIN 4자리 (삭제용)" inputMode="numeric" pattern="\d{4}" maxLength={4} required />
      </div>
      <input name="title" placeholder="제목" maxLength={100} required />
      <textarea name="content" placeholder="내용 (현장 질문, 잡담, 정보 공유 모두 환영)" rows={6} maxLength={5000} required />
      <input name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px" }} aria-hidden="true" />
      {msg && <p className="form-msg">{msg}</p>}
      <div className="form-row">
        <button className="cta" disabled={busy} style={{ border: 0, cursor: "pointer" }}>{busy ? "등록 중…" : "등록"}</button>
        <button type="button" className="cta ghost" onClick={() => setOpen(false)} style={{ cursor: "pointer" }}>취소</button>
      </div>
    </form>
  );
}

export function CommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(fd), post_id: postId }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setMsg(data.error ?? "오류가 발생했습니다"); return; }
    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="board-form">
      <div className="form-row">
        <input name="nickname" placeholder="닉네임" maxLength={20} required />
        <input name="pin" placeholder="PIN 4자리" inputMode="numeric" pattern="\d{4}" maxLength={4} required />
      </div>
      <textarea name="content" placeholder="댓글 작성" rows={3} maxLength={2000} required />
      <input name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px" }} aria-hidden="true" />
      {msg && <p className="form-msg">{msg}</p>}
      <button className="cta" disabled={busy} style={{ border: 0, cursor: "pointer", alignSelf: "flex-start" }}>{busy ? "등록 중…" : "댓글 등록"}</button>
    </form>
  );
}

export function DeleteButton({ type, id }: { type: "post" | "comment"; id: string }) {
  const router = useRouter();
  async function del() {
    const pin = prompt("작성 시 입력한 PIN 4자리를 입력하세요");
    if (!pin) return;
    const res = await fetch("/api/board/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, pin }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error ?? "삭제 실패"); return; }
    if (type === "post") router.push("/board"); else router.refresh();
  }
  return <button onClick={del} className="del-btn">삭제</button>;
}
