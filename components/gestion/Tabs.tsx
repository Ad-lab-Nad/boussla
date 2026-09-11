"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/gestion", label: "Tableau de bord" },
  { href: "/gestion/commandes", label: "Commandes" },
  { href: "/gestion/stock", label: "Stock" },
  { href: "/gestion/produits-finis", label: "Stock produits finis" },
  { href: "/gestion/produits", label: "Produits" },
  { href: "/gestion/depenses", label: "Dépenses" },
];

export function Tabs() {
  const pathname = usePathname();
  return (
    <div className="tabs">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`tab-btn ${pathname === tab.href ? "active" : ""}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
