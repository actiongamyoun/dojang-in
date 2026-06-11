"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", icon: "home", label: "홈" },
  { href: "/guide", icon: "menu_book", label: "지식" },
  { href: "/tools", icon: "construction", label: "도구" },
  { href: "/board", icon: "forum", label: "소통" },
];

export default function TabBar() {
  const path = usePathname();
  const isOn = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href);

  return (
    <nav className="tabbar">
      <div className="in">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} className={isOn(t.href) ? "on" : ""}>
            <span className="ti ms" aria-hidden>{t.icon}</span>
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
