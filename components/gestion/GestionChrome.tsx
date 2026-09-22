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
import { LocaleProvider, useLocale } from "@/components/i18n/LocaleProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import type { TFunction } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/config";

type ActivityType = "PRODUCTS" | "SERVICES";

// Hidden from the nav when the account is on Palier 1 — everything else
// (Tableau de bord, Dépenses, Abonnement) stays available to both tiers.
const PALIER_2_ONLY_HREFS = new Set([
  "/gestion/analyse",
  "/gestion/commandes",
  "/gestion/clients",
  "/gestion/stock",
  "/gestion/produits-finis",
  "/gestion/produits",
]);

// Kept separate from the visible/filtered list below so a directly-typed
// URL to a hidden page (e.g. /gestion/stock under Services) still gets the
// right topbar title instead of falling back to "Tableau de bord".
function buildFullNav(activityType: ActivityType, t: TFunction) {
  const isServices = activityType === "SERVICES";
  return [
    { href: "/gestion", label: t("gestion.nav.dashboard"), icon: LayoutDashboard },
    { href: "/gestion/analyse", label: t("gestion.nav.analyse"), icon: LineChart },
    {
      href: "/gestion/commandes",
      label: isServices ? t("gestion.nav.sales") : t("gestion.nav.orders"),
      icon: ShoppingCart,
    },
    { href: "/gestion/clients", label: t("gestion.nav.clients"), icon: Users },
    { href: "/gestion/stock", label: t("gestion.nav.stock"), icon: Package },
    { href: "/gestion/produits-finis", label: t("gestion.nav.finishedGoods"), icon: Boxes },
    {
      href: "/gestion/produits",
      label: isServices ? t("gestion.nav.services") : t("gestion.nav.products"),
      icon: Tag,
    },
    { href: "/gestion/depenses", label: t("gestion.nav.expenses"), icon: Receipt },
    // Not in the main nav — linked from the sidebar footer instead, next to
    // the account email. Kept in this list so its topbar title still
    // resolves correctly (see the comment above).
    { href: "/gestion/abonnement", label: t("gestion.nav.subscription"), icon: CreditCard },
  ];
}

export function GestionChrome({
  children,
  userEmail,
  activityType,
  hasPalier2,
  initialLocale,
}: {
  children: React.ReactNode;
  userEmail: string;
  activityType: ActivityType;
  hasPalier2: boolean;
  initialLocale?: Locale;
}) {
  return (
    <LocaleProvider mirrorLayout initialLocale={initialLocale}>
      <GestionChromeInner userEmail={userEmail} activityType={activityType} hasPalier2={hasPalier2}>
        {children}
      </GestionChromeInner>
    </LocaleProvider>
  );
}

function GestionChromeInner({
  children,
  userEmail,
  activityType,
  hasPalier2,
}: {
  children: React.ReactNode;
  userEmail: string;
  activityType: ActivityType;
  hasPalier2: boolean;
}) {
  const { t } = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const fullNav = buildFullNav(activityType, t);
  const isServices = activityType === "SERVICES";
  const nav = fullNav.filter((n) => {
    if (n.href === "/gestion/abonnement") return false;
    if (!hasPalier2 && PALIER_2_ONLY_HREFS.has(n.href)) return false;
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
            <span className="g-brand__sub">{t("gestion.nav.brandSubtitle")}</span>
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
          <LanguageSwitcher />
          <Link
            href="/gestion/abonnement"
            className={`g-nav-item ${pathname === "/gestion/abonnement" ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            <CreditCard />
            {t("gestion.nav.subscription")}
          </Link>
          {userEmail === ADMIN_EMAIL && (
            <Link href="/admin" className="g-nav-item" onClick={() => setOpen(false)}>
              <ShieldCheck />
              {t("gestion.nav.backOffice")}
            </Link>
          )}
          <form action={signOut}>
            <button type="submit" className="g-nav-item g-logout-btn">
              <LogOut />
              {t("gestion.nav.logout")}
            </button>
          </form>
        </div>
      </aside>

      <div className="g-main">
        <div className="g-topbar">
          <button
            className="g-menu-btn"
            onClick={() => setOpen((v) => !v)}
            aria-label={t("gestion.nav.openMenu")}
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
