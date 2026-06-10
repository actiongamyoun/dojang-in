"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", icon: "🏠", label: "홈" },
  { href: "/guide", icon: "📘", label: "지식" },
  { href: "/tools", icon: "🧰", label: "도구" },
  { href: "/board", icon: "💬", label: "소통" },
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
            <span className="ti">{t.icon}</span>
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
