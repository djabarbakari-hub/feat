"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Home, LayoutList, UserRound } from "lucide-react";

const TABS = [
  { href: "/today", label: "Accueil", icon: Home },
  { href: "/program", label: "Programme", icon: LayoutList },
  { href: "/progress", label: "Suivi", icon: Activity },
  { href: "/profile", label: "Profil", icon: UserRound },
];

export function TabBar() {
  const pathname = usePathname();
  if (pathname?.startsWith("/workout")) return null;

  return (
    <nav className="tabbar" aria-label="Navigation principale">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const on = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
        return (
          <Link key={tab.href} href={tab.href} className={on ? "is-on" : ""}>
            <Icon size={18} strokeWidth={2.4} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
