"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content: "안녕하세요! 도장인 AI입니다 🛠️\n도장검사·도료·표면처리·규격·자격증에 대해 물어보세요.\n\n예) \"Sa 2½ 합격 기준이 뭐야?\", \"노점차 3도 룰이 뭐죠?\"",
};

// 마크다운 링크 [텍스트](/guide/slug) + 굵게 + 줄바꿈만 가볍게 렌더
function render(text: string) {
  const esc = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc
    .replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, '<a href="$2" class="chat-link">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    if (q.length > 500) return;
    const next = [...msgs, { role: "user" as const, content: q }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m !== GREETING) }),
      });
      const data = await res.json();
      setMsgs((m) => [...m, { role: "assistant", content: res.ok ? data.reply : `⚠️ ${data.error}` }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "⚠️ 연결에 문제가 있어요. 잠시 후 다시 시도해주세요." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen((o) => !o)} aria-label="AI 챗봇 열기">
        <span className="ms" aria-hidden>{open ? "close" : "smart_toy"}</span>
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-head">
            <span className="ms" aria-hidden>smart_toy</span>
            <div>
              <b>도장인 AI</b>
              <small>도장검사 무엇이든 물어보세요</small>
            </div>
          </div>

          <div className="chat-body" ref={bodyRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                <div className="bubble" dangerouslySetInnerHTML={{ __html: render(m.content) }} />
              </div>
            ))}
            {busy && (
              <div className="chat-msg assistant">
                <div className="bubble typing"><span></span><span></span><span></span></div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="질문을 입력하세요…"
              maxLength={500}
              disabled={busy}
            />
            <button onClick={send} disabled={busy || !input.trim()} aria-label="전송">
              <span className="ms" aria-hidden>send</span>
            </button>
          </div>
          <p className="chat-foot">AI 답변은 참고용입니다. 정확한 기준은 사양서를 확인하세요.</p>
        </div>
      )}
    </>
  );
}
