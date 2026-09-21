"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  ShoppingCart,
  Users,
  Package,
  Boxes,
  Tag,
  Receipt,
  CreditCard,
  Menu,
  X,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { signOut } from "@/lib/auth-actions";
import { ADMIN_EMAIL } from "@/lib/admin-email";

type ActivityType = "PRODUCTS" | "SERVICES";

// Kept separate from the visible/filtered list below so a directly-typed
// URL to a hidden page (e.g. /gestion/stock under Services) still gets the
// right topbar title instead of falling back to "Tableau de bord".
function buildFullNav(activityType: ActivityType) {
  const isServices = activityType === "SERVICES";
  return [
    { href: "/gestion", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/gestion/analyse", label: "Analyse", icon: LineChart },
    {
      href: "/gestion/commandes",
      label: isServices ? "Ventes" : "Commandes",
      icon: ShoppingCart,
    },
    { href: "/gestion/clients", label: "Clients", icon: Users },
    { href: "/gestion/stock", label: "Stock", icon: Package },
    { href: "/gestion/produits-finis", label: "Stock produits finis", icon: Boxes },
    {
      href: "/gestion/produits",
      label: isServices ? "Prestations" : "Produits",
      icon: Tag,
    },
    { href: "/gestion/depenses", label: "Dépenses", icon: Receipt },
    // Not in the main nav — linked from the sidebar footer instead, next to
    // the account email. Kept in this list so its topbar title still
    // resolves correctly (see the comment above).
    { href: "/gestion/abonnement", label: "Abonnement", icon: CreditCard },
  ];
}

export function GestionChrome({
  children,
  userEmail,
  activityType,
}: {
  children: React.ReactNode;
  userEmail: string;
  activityType: ActivityType;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const fullNav = buildFullNav(activityType);
  const isServices = activityType === "SERVICES";
  const nav = fullNav.filter((n) => {
    if (n.href === "/gestion/abonnement") return false;
    if (isServices) return n.href !== "/gestion/stock" && n.href !== "/gestion/produits-finis";
    return true;
  });
  const current = fullNav.find((n) => n.href === pathname) ?? fullNav[0];

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
          {nav.map((item) => {
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
          <Link
            href="/gestion/abonnement"
            className={`g-nav-item ${pathname === "/gestion/abonnement" ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            <CreditCard />
            Abonnement
          </Link>
          {userEmail === ADMIN_EMAIL && (
            <Link href="/admin" className="g-nav-item" onClick={() => setOpen(false)}>
              <ShieldCheck />
              Back office
            </Link>
          )}
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
