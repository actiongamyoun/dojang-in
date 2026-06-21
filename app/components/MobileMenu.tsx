"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const items = [
  { href: "/news", icon: "newspaper", label: "새소식" },
  { href: "/guide", icon: "menu_book", label: "지식" },
  { href: "/tools", icon: "construction", label: "도구" },
  { href: "/cert", icon: "workspace_premium", label: "자격증" },
  { href: "/jobs", icon: "work", label: "구인·구직" },
  { href: "/board", icon: "forum", label: "소통" },
];

export default function MobileMenu() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button className="hamburger" onClick={() => setOpen(true)} aria-label="메뉴 열기">
        <span className="ms" aria-hidden>menu</span>
      </button>

      {open && <div className="drawer-dim" onClick={() => setOpen(false)} />}

      <aside className={`drawer ${open ? "open" : ""}`}>
        <div className="drawer-head">
          <span className="logo-text">도장인</span>
          <button onClick={() => setOpen(false)} aria-label="닫기"><span className="ms" aria-hidden>close</span></button>
        </div>
        <nav className="drawer-nav">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className={path.startsWith(i.href) ? "on" : ""}>
              <span className="ms" aria-hidden>{i.icon}</span>
              {i.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
