"use client";

import { useEffect, useState } from "react";

export default function LangToggle() {
  const [lang, setLang] = useState<"ko" | "en">("ko");
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dj_lang");
    if (saved === "en" || saved === "ko") setLang(saved);
  }, []);

  function toggle() {
    const next = lang === "ko" ? "en" : "ko";
    setLang(next);
    localStorage.setItem("dj_lang", next);
    if (next === "en") {
      setToast(true);
      setTimeout(() => setToast(false), 2200);
    }
  }

  return (
    <>
      <button onClick={toggle} className="lang-toggle" aria-label="언어 전환">
        <span className="ms" aria-hidden>language</span>
        <span className={lang === "ko" ? "on" : ""}>한</span>
        <i>|</i>
        <span className={lang === "en" ? "on" : ""}>EN</span>
      </button>
      {toast && <div className="toast">🌐 English version coming soon!</div>}
    </>
  );
}
