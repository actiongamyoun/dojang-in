"use client";

import { useEffect, useState } from "react";

export default function VisitorStats() {
  const [stats, setStats] = useState<{ today: number; total: number } | null>(null);

  useEffect(() => {
    async function run() {
      try {
        if (!sessionStorage.getItem("dj_visited")) {
          sessionStorage.setItem("dj_visited", "1");
          await fetch("/api/visit", { method: "POST" });
        }
        const res = await fetch("/api/visit");
        const data = await res.json();
        if (data.enabled) setStats({ today: data.today, total: data.total });
      } catch { /* 미설정 시 숨김 */ }
    }
    run();
  }, []);

  if (!stats) return null;

  return (
    <div className="stat-card">
      <div><small>오늘 방문</small><b>{stats.today.toLocaleString()}</b></div>
      <div><small>누적 방문</small><b>{stats.total.toLocaleString()}</b></div>
    </div>
  );
}
