"use client";

import { useEffect, useState } from "react";

const CATS = ["표면처리", "도장작업", "도료", "측정·검사", "결함·보수", "자격증·규격"];

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

  // 기존 글 목록 (수정용)
  const [postList, setPostList] = useState<{ slug: string; title: string; kind: string }[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem("dj_admin_pw");
    if (saved) { setPw(saved); setAuthed(true); }
  }, []);

  useEffect(() => {
    if (authed && postList.length === 0) {
      fetch("/api/admin/load")
        .then((r) => r.json())
        .then((d) => setPostList(d.list ?? []))
        .catch(() => {});
    }
  }, [authed, postList.length]);

  useEffect(() => {
    if (authed && tab === "tools" && tools.length === 0) {
      fetch("/api/tools-current")
        .then((r) => r.json())
        .then((d) => setTools(d.tools ?? []))
        .catch(() => {});
    }
  }, [authed, tab, tools.length]);

  const [uploading, setUploading] = useState(false);

  async function uploadPhoto(file: File) {
    setUploading(true); setMsg("");
    try {
      // 1) 캔버스 압축 (최대 1600px, JPEG 0.82)
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = URL.createObjectURL(file);
      });
      const MAX = 1600;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b!), "image/jpeg", 0.82)
      );

      // 2) Cloudinary 업로드 (unsigned preset)
      const CLOUD = "dmb7hu1en";
      const PRESET = "dojangin_photos";
      const fd = new FormData();
      fd.append("file", blob, "photo.jpg");
      fd.append("upload_preset", PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("Cloudinary 업로드 실패 — preset(dojangin_photos) 생성 여부 확인");
      const data = await res.json();

      // 3) 본문에 마크다운 삽입
      setContent((prev) => prev + (prev.endsWith("\n") || prev === "" ? "" : "\n\n") + `![사진 설명](${data.secure_url})\n`);
      setMsg(`📷 사진 업로드 완료 (${Math.round(blob.size / 1024)}KB) — 본문에 삽입됨, "사진 설명"을 수정하세요`);
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setUploading(false);
    }
  }

  const [analyzing, setAnalyzing] = useState(false);
  const [aType, setAType] = useState("defect");
  const [aHint, setAHint] = useState("");
  const [aSearch, setASearch] = useState(false);

  async function fileToBase64(file: File): Promise<{ data: string; mediaType: string }> {
    // 압축 후 base64 (Vision 비용·속도 위해 최대 1280px)
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej;
      i.src = URL.createObjectURL(file);
    });
    const MAX = 1280;
    const scale = Math.min(1, MAX / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL("image/jpeg", 0.85);
    return { data: dataUrl.split(",")[1], mediaType: "image/jpeg" };
  }

  async function analyzePhoto(file: File) {
    setAnalyzing(true); setMsg("");
    try {
      const { data, mediaType } = await fileToBase64(file);
      const res = await fetch("/api/admin/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, imageBase64: data, mediaType, type: aType, hint: aHint, useSearch: aSearch }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setKind("guide");
      if (d.title) setTitle(d.title);
      if (d.category && CATS.includes(d.category)) setCategory(d.category);
      if (d.tags?.length) setTags(d.tags.join(", "));
      if (d.description) setDescription(d.description);
      if (d.content) setContent(d.content);
      setMsg("🤖 AI 초안 생성 완료 — 내용을 검수·수정한 뒤 발행하세요. slug는 직접 입력하세요.");
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setAnalyzing(false);
    }
  }

  async function loadPost(key: string) {
    if (!key) return;
    const [k, sg] = key.split("::");
    const res = await fetch(`/api/admin/load?kind=${k}&slug=${sg}`);
    if (!res.ok) { setMsg("❌ 글을 불러오지 못했습니다"); return; }
    const d = await res.json();
    setKind(d.kind === "notice" ? "notice" : "guide");
    setSlug(d.slug); setTitle(d.title);
    if (CATS.includes(d.category)) setCategory(d.category);
    setTags(d.tags); setDescription(d.description); setContent(d.content);
    setMsg(`📂 "${d.title}" 불러옴 — 수정 후 발행하면 덮어쓰기됩니다`);
  }

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
            <select defaultValue="" onChange={(e) => { loadPost(e.target.value); e.target.value = ""; }}>
              <option value="">✏️ 새 글 작성 — 또는 기존 글 선택해서 수정</option>
              {postList.map((p) => (
                <option key={`${p.kind}::${p.slug}`} value={`${p.kind}::${p.slug}`}>
                  [{p.kind === "notice" ? "공지" : "지식"}] {p.title}
                </option>
              ))}
            </select>
            <div className="ai-box">
              <b style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                <span className="ms" aria-hidden>auto_awesome</span> AI 사진 분석 — 사진 올리면 초안 자동 작성
              </b>
              <div className="form-row">
                <select value={aType} onChange={(e) => setAType(e.target.value)}>
                  <option value="defect">결함 진단</option>
                  <option value="measure">측정·장비</option>
                  <option value="paint">도료</option>
                  <option value="general">범용 (알아서 판단)</option>
                  <option value="news">사진 + 최신 뉴스 검색</option>
                </select>
                <label className="ai-check">
                  <input type="checkbox" checked={aSearch} onChange={(e) => setASearch(e.target.checked)} />
                  웹검색 포함
                </label>
              </div>
              <input placeholder="(선택) 메모 — 사진 보충 설명: 예) 발라스트 탱크 내부, 도장 3일 후" value={aHint} onChange={(e) => setAHint(e.target.value)} />
              <label className="btn" style={{ textAlign: "center", cursor: analyzing ? "default" : "pointer", opacity: analyzing ? .6 : 1 }}>
                {analyzing ? "AI 분석 중… (최대 1분)" : "📷 사진 선택해서 분석"}
                <input type="file" accept="image/*" style={{ display: "none" }} disabled={analyzing}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) analyzePhoto(f); e.target.value = ""; }} />
              </label>
            </div>
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
            <div className="form-row">
              <label className="btn ghost" style={{ textAlign: "center", cursor: "pointer" }}>
                {uploading ? "업로드 중…" : "📷 사진 추가 (자동 압축)"}
                <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploading}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = ""; }} />
              </label>
              <button className="btn" onClick={publish} disabled={busy || uploading}>{busy ? "발행 중…" : "발행하기"}</button>
            </div>
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
