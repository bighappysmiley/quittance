"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, Clock3, Settings } from "lucide-react";

const tabs = [
  { href: "/ledger", label: "Ledger", icon: BookOpenText },
  { href: "/activity", label: "Activity", icon: Clock3 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav" aria-label="Main">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="nav-item"
            data-active={active}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={18} strokeWidth={active ? 2.4 : 1.9} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
