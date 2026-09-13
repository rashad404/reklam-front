"use client";
import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  Menu,
  Moon,
  Sun,
  X,
  UserRound,
  ChevronDown,
  Megaphone,
  PanelsTopLeft,
  LayoutDashboard,
  BarChart3,
  Globe2,
  Settings2,
  LifeBuoy,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import { Link, usePathname, useRouter } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";
import { openWalletLogin } from "@/lib/utils/walletAuth";
import api from "@/lib/api/client";
export default function Header() {
  const t = useTranslations("product"),
    locale = useLocale(),
    path = usePathname(),
    router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { user, isAuthenticated, refresh } = useAuth();
  const [menu, setMenu] = useState(false),
    [error, setError] = useState(false);
  const workspace =
    !!isAuthenticated &&
    /^\/(advertiser|publisher|settings|admin)(\/|$)/.test(path);
  const role = path.startsWith("/publisher")
    ? "publisher"
    : path.startsWith("/admin")
      ? "admin"
      : "advertiser";
  const links = [
    ["/for-advertisers", "navAdvertisers"],
    ["/for-publishers", "navPublishers"],
    ["/ad-formats", "formats"],
  ];
  const tabs =
    role === "publisher"
      ? [
          { href: "/publisher", label: "overview", icon: LayoutDashboard },
          { href: "/publisher/site", label: "site", icon: Globe2 },
          {
            href: "/publisher/ad-units",
            label: "placements",
            icon: PanelsTopLeft,
          },
          { href: "/publisher/stats", label: "reports", icon: BarChart3 },
        ]
      : role === "admin"
        ? [
            { href: "/admin", label: "overview", icon: LayoutDashboard },
            { href: "/admin/ads", label: "campaigns", icon: Megaphone },
            { href: "/admin/publishers", label: "site", icon: ShieldCheck },
            { href: "/admin/support", label: "support", icon: LifeBuoy },
          ]
        : [
            { href: "/advertiser", label: "overview", icon: LayoutDashboard },
            {
              href: "/advertiser/campaigns",
              label: "campaigns",
              icon: Megaphone,
            },
            { href: "/advertiser/stats", label: "reports", icon: BarChart3 },
          ];
  async function login() {
    setError(false);
    await openWalletLogin({ locale, onError: () => setError(true) });
  }
  async function logout() {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("token");
      await refresh();
      setMenu(false);
    } catch {
      setError(true);
    }
  }
  return (
    <>
      <a className="skip" href="#main-content">
        {t("skip")}
      </a>
      <header className={`site-header ${workspace ? "workspace-header" : ""}`}>
        <div className="wrap header-inner">
          <Link href="/" aria-label="Reklam.biz" className="brand-link">
            <Image
              unoptimized
              className="header-logo dark:hidden"
              src="/images/logo.svg"
              alt="Reklam.biz"
              width={130}
              height={32}
            />
            <Image
              unoptimized
              className="header-logo hidden dark:block"
              src="/images/logo-white.svg"
              alt="Reklam.biz"
              width={130}
              height={32}
            />
          </Link>
          {workspace ? (
            <div className="workspace-breadcrumb">
              <span className="breadcrumb-slash">/</span>
              {t(role)}
            </div>
          ) : (
            <nav className="header-nav" aria-label={t("menu")}>
              {links.map(([href, key]) => (
                <Link
                  href={href}
                  key={href}
                  aria-current={path === href ? "page" : undefined}
                >
                  {t(key)}
                </Link>
              ))}
            </nav>
          )}
          <div className="header-actions">
            <select
              className="language"
              aria-label="Language"
              value={locale}
              onChange={(e) => router.replace(path, { locale: e.target.value })}
            >
              <option value="az">AZ</option>
              <option value="en">EN</option>
              <option value="ru">RU</option>
            </select>
            <button
              className="btn-quiet theme-toggle"
              aria-label={t(resolvedTheme === "dark" ? "light" : "dark")}
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              <Sun size={18} className="hidden dark:block" />
              <Moon size={18} className="dark:hidden" />
            </button>
            {isAuthenticated ? (
              <button
                className="profile-trigger"
                aria-label={t("menu")}
                aria-expanded={menu}
                onClick={() => setMenu(!menu)}
              >
                <span className="avatar">
                  {user?.name?.slice(0, 1).toLocaleUpperCase(locale) || (
                    <UserRound size={18} />
                  )}
                </span>
                <span className="profile-name">{user?.name}</span>
                <ChevronDown size={14} />
              </button>
            ) : (
              <>
                <button
                  className="btn-primary sign-in-button"
                  aria-label={t("signIn")}
                  onClick={login}
                >
                  <UserRound size={18} aria-hidden="true" />
                  <span className="sign-in-label">{t("signIn")}</span>
                </button>
                <button
                  className="btn-quiet mobile-toggle"
                  aria-label={t(menu ? "close" : "menu")}
                  aria-expanded={menu}
                  onClick={() => setMenu(!menu)}
                >
                  {menu ? <X size={21} /> : <Menu size={21} />}
                </button>
              </>
            )}
          </div>
        </div>
        {menu && (
          <nav className="account-menu" aria-label={t("menu")}>
            {links.map(([href, key]) => (
              <Link href={href} key={href} onClick={() => setMenu(false)}>
                {t(key)}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <div className="menu-divider" />
                <Link href="/advertiser" onClick={() => setMenu(false)}>
                  <Megaphone size={17} />
                  {t("advertiser")}
                </Link>
                <Link href="/publisher" onClick={() => setMenu(false)}>
                  <PanelsTopLeft size={17} />
                  {t("publisher")}
                </Link>
                <Link href="/settings" onClick={() => setMenu(false)}>
                  <Settings2 size={17} />
                  {t("settings")}
                </Link>
                {user?.is_admin && (
                  <Link href="/admin" onClick={() => setMenu(false)}>
                    <ShieldCheck size={17} />
                    {t("admin")}
                  </Link>
                )}
                <button className="btn-secondary" onClick={logout}>
                  {t("signOut")}
                </button>
              </>
            )}
          </nav>
        )}
      </header>
      {error && (
        <div className="wrap notice error" role="alert">
          {t("loadError")}
        </div>
      )}
      {workspace && (
        <aside className="workspace-nav" aria-label={t(role)}>
          <div className="workspace-switch">
            <Link
              href="/advertiser"
              aria-current={role === "advertiser" ? "page" : undefined}
            >
              <Megaphone size={17} />
              {t("navAdvertisers")}
            </Link>
            <Link
              href="/publisher"
              aria-current={role === "publisher" ? "page" : undefined}
            >
              <PanelsTopLeft size={17} />
              {t("navPublishers")}
            </Link>
          </div>
          <div className="sidebar-label">{t(role)}</div>
          <nav className="workspace-tabs" aria-label={t("menu")}>
            {tabs.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={
                  path === href ||
                  (href !== `/${role}` && path.startsWith(href + "/"))
                    ? "page"
                    : undefined
                }
              >
                <Icon size={19} />
                <span>{t(label)}</span>
              </Link>
            ))}
          </nav>
          <nav className="workspace-bottom" aria-label={t("help")}>
            <Link href="/settings">
              <Settings2 size={19} />
              {t("settings")}
            </Link>
            <Link href="/settings/support">
              <LifeBuoy size={19} />
              {t("support")}
            </Link>
            <Link href="/ad-formats">
              <Layers3 size={19} />
              {t("formats")}
            </Link>
          </nav>
        </aside>
      )}
    </>
  );
}
