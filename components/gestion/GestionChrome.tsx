"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Tag,
  Receipt,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/auth-actions";

const NAV = [
  { href: "/gestion", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/gestion/commandes", label: "Commandes", icon: ShoppingCart },
  { href: "/gestion/stock", label: "Stock", icon: Package },
  { href: "/gestion/produits-finis", label: "Stock produits finis", icon: Boxes },
  { href: "/gestion/produits", label: "Produits", icon: Tag },
  { href: "/gestion/depenses", label: "Dépenses", icon: Receipt },
];

export function GestionChrome({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = NAV.find((n) => n.href === pathname) ?? NAV[0];

  return (
    <div className="g-shell">
      <div className={`g-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} />

      <aside className={`g-sidebar ${open ? "open" : ""}`}>
        <div className="g-brand">
          <div className="g-brand__mark">B</div>
          <div className="g-brand__text">
            <span className="g-brand__name">Boussla</span>
            <span className="g-brand__sub">Gestion</span>
          </div>
        </div>

        <nav className="g-nav">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.href === pathname;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`g-nav-item ${active ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <Icon />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="g-sidebar__footer">
          <div className="g-user-email" title={userEmail}>
            {userEmail}
          </div>
          <form action={signOut}>
            <button type="submit" className="g-nav-item g-logout-btn">
              <LogOut />
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      <div className="g-main">
        <div className="g-topbar">
          <button
            className="g-menu-btn"
            onClick={() => setOpen((v) => !v)}
            aria-label="Ouvrir le menu"
          >
            {open ? <X /> : <Menu />}
          </button>
          <h1>{current.label}</h1>
        </div>
        <div className="g-page-body">{children}</div>
      </div>
    </div>
  );
}
