"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/news", icon: "newspaper", label: "새소식" },
  { href: "/guide", icon: "menu_book", label: "지식" },
  { href: "/tools", icon: "construction", label: "도구" },
  { href: "/cert", icon: "workspace_premium", label: "자격증" },
  { href: "/jobs", icon: "work", label: "구인구직" },
  { href: "/board", icon: "forum", label: "소통" },
];

export default function TopNav() {
  const path = usePathname();
  return (
    <nav className="topnav">
      {items.map((i) => (
        <Link key={i.href} href={i.href} className={path.startsWith(i.href) ? "on" : ""}>
          <span className="ms" aria-hidden>{i.icon}</span>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
