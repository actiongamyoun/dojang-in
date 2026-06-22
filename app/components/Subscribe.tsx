"use client";

import { useState } from "react";

export default function Subscribe() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit() {
    if (busy || !email.trim()) return;
    setBusy(true); setMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
    } catch (e: any) {
      setMsg(e.message ?? "오류가 발생했습니다");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="subscribe">
      <div className="sub-head">
        <span className="ms" aria-hidden>mail</span>
        <div>
          <b>도장인 뉴스레터</b>
          <small>매일 아침 7시, 조선·도장 뉴스를 메일로</small>
        </div>
      </div>
      {done ? (
        <p className="sub-done">✅ 구독 완료! 내일 아침부터 받아보실 수 있어요.</p>
      ) : (
        <>
          <div className="sub-row">
            <input
              type="email" placeholder="이메일 주소" value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <button onClick={submit} disabled={busy}>{busy ? "처리중" : "구독"}</button>
          </div>
          {msg && <p className="form-msg" style={{ marginTop: 6 }}>{msg}</p>}
        </>
      )}
    </div>
  );
}
