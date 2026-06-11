"use client";

import { useEffect, useState } from "react";

const CATS = ["표면처리", "도장작업", "측정·검사", "결함·보수", "자격증·규격"];

type Tool = { name: string; desc: string; icon: string; color: string; url: string; status: "open" | "soon" };

export default function AdminPage() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"post" | "tools">("post");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // 글 등록 폼
  const [kind, setKind] = useState<"guide" | "notice">("guide");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATS[0]);
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  // 도구 관리
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem("dj_admin_pw");
    if (saved) { setPw(saved); setAuthed(true); }
  }, []);

  useEffect(() => {
    if (authed && tab === "tools" && tools.length === 0) {
      fetch("/api/tools-current")
        .then((r) => r.json())
        .then((d) => setTools(d.tools ?? []))
        .catch(() => {});
    }
  }, [authed, tab, tools.length]);

  function login() {
    if (!pw.trim()) return;
    sessionStorage.setItem("dj_admin_pw", pw);
    setAuthed(true);
  }

  async function publish() {
    if (busy) return;
    setBusy(true); setMsg("");
    try {
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: pw,
          type: kind,
          slug: slug.trim(),
          title, category,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          description, content,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg(`✅ 발행 완료 (${data.path}) — 1~2분 후 사이트에 반영됩니다`);
      setSlug(""); setTitle(""); setTags(""); setDescription(""); setContent("");
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
      if (e.message?.includes("비밀번호")) { sessionStorage.removeItem("dj_admin_pw"); setAuthed(false); }
    } finally {
      setBusy(false);
    }
  }

  async function saveTools() {
    if (busy) return;
    setBusy(true); setMsg("");
    try {
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, type: "tools", tools }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg("✅ 도구 목록 저장 완료 — 1~2분 후 반영됩니다");
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  function setTool(i: number, key: keyof Tool, val: string) {
    setTools((prev) => prev.map((t, idx) => (idx === i ? { ...t, [key]: val } : t)));
  }

  if (!authed) {
    return (
      <main>
        <div className="sec board-wrap">
          <div className="board-form" style={{ maxWidth: 380, margin: "40px auto" }}>
            <b style={{ fontSize: 15 }}>🔐 관리자 로그인</b>
            <input type="password" placeholder="관리자 비밀번호" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
            <button className="btn" onClick={login}>입장</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="chips" style={{ maxWidth: 820 }}>
        <button className={`chip ${tab === "post" ? "on" : ""}`} onClick={() => setTab("post")}>글 등록</button>
        <button className={`chip ${tab === "tools" ? "on" : ""}`} onClick={() => setTab("tools")}>도구 관리</button>
      </div>

      <div className="sec board-wrap">
        {msg && <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{msg}</p>}

        {tab === "post" && (
          <div className="board-form">
            <div className="form-row">
              <select value={kind} onChange={(e) => setKind(e.target.value as any)}>
                <option value="guide">지식 글</option>
                <option value="notice">공지 (새소식)</option>
              </select>
              {kind === "guide" && (
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>
            <input placeholder="slug — 영문 소문자·하이픈 (예: adhesion-test)" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} />
            <input placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input placeholder="태그 — 쉼표 구분 (예: ISO 4624, 부착력)" value={tags} onChange={(e) => setTags(e.target.value)} />
            <input placeholder="설명 — 목록·검색에 노출되는 1~2문장" value={description} onChange={(e) => setDescription(e.target.value)} />
            <textarea placeholder={"본문 — 마크다운 사용 가능\n## 소제목\n**굵게**, 표, 목록, [링크](주소)"} rows={16} value={content} onChange={(e) => setContent(e.target.value)} />
            <button className="btn" onClick={publish} disabled={busy}>{busy ? "발행 중…" : "발행하기"}</button>
            <small style={{ color: "var(--muted)", fontSize: 12 }}>
              발행 = GitHub 자동 커밋 → Vercel 재배포 (1~2분 소요). 같은 slug로 발행하면 기존 글이 수정됩니다.
            </small>
          </div>
        )}

        {tab === "tools" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tools.map((t, i) => (
              <div key={i} className="board-form" style={{ marginTop: 0 }}>
                <div className="form-row">
                  <input placeholder="이름" value={t.name} onChange={(e) => setTool(i, "name", e.target.value)} />
                  <select value={t.status} onChange={(e) => setTool(i, "status", e.target.value)}>
                    <option value="open">OPEN</option>
                    <option value="soon">준비 중</option>
                  </select>
                </div>
                <input placeholder="설명 — | 로 줄바꿈 (예: 노점·ΔT3|도장 가능 판정)" value={t.desc} onChange={(e) => setTool(i, "desc", e.target.value)} />
                <div className="form-row">
                  <input placeholder="아이콘 (Material 이름, 예: water_drop)" value={t.icon} onChange={(e) => setTool(i, "icon", e.target.value)} />
                  <select value={t.color} onChange={(e) => setTool(i, "color", e.target.value)}>
                    <option value="a1">파랑</option><option value="a2">청록</option>
                    <option value="a3">남보라</option><option value="a4">주황</option>
                  </select>
                </div>
                <input placeholder="URL (https://...)" value={t.url} onChange={(e) => setTool(i, "url", e.target.value)} />
                <button className="btn ghost" style={{ alignSelf: "flex-end", padding: "8px 14px", fontSize: 12 }} onClick={() => setTools(tools.filter((_, idx) => idx !== i))}>삭제</button>
              </div>
            ))}
            <div className="form-row">
              <button className="btn ghost" onClick={() => setTools([...tools, { name: "", desc: "", icon: "build", color: "a1", url: "", status: "soon" }])}>+ 도구 추가</button>
              <button className="btn" onClick={saveTools} disabled={busy}>{busy ? "저장 중…" : "전체 저장"}</button>
            </div>
            <small style={{ color: "var(--muted)", fontSize: 12 }}>
              아이콘 이름은 fonts.google.com/icons 에서 검색 (Material Symbols).
            </small>
          </div>
        )}
      </div>
    </main>
  );
}
