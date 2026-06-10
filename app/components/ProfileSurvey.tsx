"use client";

import { useEffect, useState } from "react";

const AGES = ["20대", "30대", "40대", "50대 이상"];
const INDUSTRIES = ["조선소", "플랜트", "건축·강구조", "도료·자재", "학생·취준", "기타"];

export default function ProfileSurvey() {
  const [show, setShow] = useState(false);
  const [age, setAge] = useState("");
  const [industry, setIndustry] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("dj_profile_done")) setShow(true);
  }, []);

  async function submit() {
    if (!age || !industry || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ age_group: age, industry }),
      });
      if (res.ok) {
        localStorage.setItem("dj_profile_done", "1");
        setDone(true);
        setTimeout(() => setShow(false), 2000);
      }
    } finally {
      setBusy(false);
    }
  }

  function dismiss() {
    localStorage.setItem("dj_profile_done", "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="survey-card">
      {done ? (
        <p style={{ fontSize: 14, fontWeight: 700 }}>참여 감사합니다! 더 좋은 콘텐츠로 보답할게요 🙌</p>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <b style={{ fontSize: 14 }}>어떤 분이 오셨나요? (익명 · 10초)</b>
            <button onClick={dismiss} className="del-btn" style={{ textDecoration: "none" }}>닫기 ✕</button>
          </div>
          <small style={{ color: "var(--muted)", fontSize: 12 }}>콘텐츠 방향을 정하는 데만 사용됩니다</small>
          <div className="survey-row">
            {AGES.map((a) => (
              <button key={a} onClick={() => setAge(a)} className={`chip ${age === a ? "on" : ""}`}>{a}</button>
            ))}
          </div>
          <div className="survey-row">
            {INDUSTRIES.map((i) => (
              <button key={i} onClick={() => setIndustry(i)} className={`chip ${industry === i ? "on" : ""}`}>{i}</button>
            ))}
          </div>
          <button className="btn" onClick={submit} disabled={!age || !industry || busy} style={{ opacity: !age || !industry ? .5 : 1 }}>
            {busy ? "저장 중…" : "제출"}
          </button>
        </>
      )}
    </div>
  );
}
