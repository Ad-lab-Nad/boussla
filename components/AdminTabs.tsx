"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/accueil", label: "Page d'accueil" },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", gap: 4, padding: "0 28px", borderBottom: "1px solid var(--g-border)" }}>
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              padding: "10px 14px",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: active ? "var(--g-blue)" : "var(--g-muted)",
              borderBottom: active ? "2px solid var(--g-blue)" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
