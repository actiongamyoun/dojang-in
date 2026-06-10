"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/news", label: "새소식" },
  { href: "/guide", label: "지식" },
  { href: "/tools", label: "도구" },
  { href: "/cert", label: "자격증" },
  { href: "/board", label: "소통" },
];

export default function TopNav() {
  const path = usePathname();
  return (
    <nav className="topnav">
      {items.map((i) => (
        <Link key={i.href} href={i.href} className={path.startsWith(i.href) ? "on" : ""}>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
