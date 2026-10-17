"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  Menu,
  Moon,
  Sun,
  X,
  UserRound,
  ChevronsUpDown,
  Megaphone,
  PanelsTopLeft,
  LayoutDashboard,
  BarChart3,
  Globe2,
  Settings2,
  LifeBuoy,
  Layers3,
  ShieldCheck,
  CircleHelp,
  LogOut,
} from "lucide-react";
import { Link, usePathname, useRouter } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api/client";
export type WorkspaceRole = "advertiser" | "publisher" | "admin";
type Tab = {
  href: string;
  label: string;
  icon: typeof Globe2;
  also?: string;
};
const tabs: Record<WorkspaceRole, Tab[]> = {
  publisher: [
    { href: "/publisher", label: "overview", icon: LayoutDashboard },
    {
      href: "/publisher/sites",
      label: "sites",
      icon: Globe2,
      also: "/publisher/ad-units",
    },
    { href: "/publisher/stats", label: "reports", icon: BarChart3 },
  ],
  admin: [
    { href: "/admin", label: "overview", icon: LayoutDashboard },
    { href: "/admin/ads", label: "campaigns", icon: Megaphone },
    { href: "/admin/publishers", label: "sites", icon: ShieldCheck },
    { href: "/admin/support", label: "support", icon: LifeBuoy },
  ],
  advertiser: [
    { href: "/advertiser", label: "overview", icon: LayoutDashboard },
    { href: "/advertiser/campaigns", label: "campaigns", icon: Megaphone },
    { href: "/advertiser/stats", label: "reports", icon: BarChart3 },
  ],
};
function Logo() {
  return (
    <>
      <Image
        unoptimized
        className="ws-logo dark:hidden"
        src="/images/logo.svg"
        alt="Reklam.biz"
        width={122}
        height={30}
      />
      <Image
        unoptimized
        className="ws-logo hidden dark:block"
        src="/images/logo-white.svg"
        alt="Reklam.biz"
        width={122}
        height={30}
      />
    </>
  );
}
export default function WorkspaceShell({ role }: { role: WorkspaceRole }) {
  const t = useTranslations("product"),
    locale = useLocale(),
    path = usePathname(),
    router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { user, refresh } = useAuth();
  const [drawer, setDrawer] = useState(false),
    [account, setAccount] = useState(false),
    [error, setError] = useState(false);
  const accountBox = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!drawer && !account) return;
    function escape(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setDrawer(false);
      setAccount(false);
    }
    function outside(e: PointerEvent) {
      if (!accountBox.current?.contains(e.target as Node)) setAccount(false);
    }
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    if (drawer) document.querySelector<HTMLElement>(".ws-close")?.focus();
    return () => {
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
    };
  }, [drawer, account]);
  async function logout() {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("token");
      await refresh();
    } catch {
      setError(true);
    }
  }
  const close = () => setDrawer(false);
  return (
    <>
      <a className="skip" href="#main-content">
        {t("skip")}
      </a>
      <div className="ws-topbar">
        <Link href="/" aria-label="Reklam.biz" className="ws-brand-link">
          <Logo />
        </Link>
        <button
          type="button"
          className="icon-button"
          aria-label={t("menu")}
          aria-expanded={drawer}
          aria-controls="workspace-sidebar"
          onClick={() => setDrawer(true)}
        >
          <Menu size={20} />
        </button>
      </div>
      <aside
        id="workspace-sidebar"
        className={`ws-sidebar ${drawer ? "open" : ""}`}
        aria-label={t(role)}
      >
        <div className="ws-brand">
          <Link
            href="/"
            aria-label="Reklam.biz"
            className="ws-brand-link"
            onClick={close}
          >
            <Logo />
          </Link>
          <button
            type="button"
            className="icon-button ws-close"
            aria-label={t("close")}
            onClick={close}
          >
            <X size={20} />
          </button>
        </div>
        {role === "admin" ? (
          <p className="ws-section">{t("admin")}</p>
        ) : (
          <div className="ws-switch" role="group" aria-label={t("workspace")}>
            <Link
              href="/advertiser"
              aria-current={role === "advertiser" ? "page" : undefined}
              onClick={close}
            >
              <Megaphone size={16} />
              {t("roleAdvertiser")}
            </Link>
            <Link
              href="/publisher"
              aria-current={role === "publisher" ? "page" : undefined}
              onClick={close}
            >
              <PanelsTopLeft size={16} />
              {t("rolePublisher")}
            </Link>
          </div>
        )}
        <nav className="ws-nav" aria-label={t("menu")}>
          {tabs[role].map(({ href, label, icon: Icon, ...tab }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              aria-current={
                path === href ||
                (href !== `/${role}` && path.startsWith(href + "/")) ||
                (!!tab.also && path.startsWith(tab.also))
                  ? "page"
                  : undefined
              }
            >
              <Icon size={18} />
              <span>{t(label)}</span>
            </Link>
          ))}
        </nav>
        <div className="ws-foot">
          <nav className="ws-links" aria-label={t("help")}>
            <Link href="/ad-formats" onClick={close}>
              <Layers3 size={17} />
              {t("formats")}
            </Link>
            <Link href="/help" onClick={close}>
              <CircleHelp size={17} />
              {t("helpShort")}
            </Link>
            <Link href="/settings/support" onClick={close}>
              <LifeBuoy size={17} />
              {t("support")}
            </Link>
          </nav>
          <div className="ws-account" ref={accountBox}>
            {account && (
              <div className="ws-account-menu">
                <Link href="/settings" onClick={close}>
                  <Settings2 size={16} />
                  {t("settings")}
                </Link>
                {user?.is_admin && role !== "admin" && (
                  <Link href="/admin" onClick={close}>
                    <ShieldCheck size={16} />
                    {t("admin")}
                  </Link>
                )}
                {role === "admin" && (
                  <Link href="/advertiser" onClick={close}>
                    <Megaphone size={16} />
                    {t("roleAdvertiser")}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                >
                  <Sun size={16} className="hidden dark:block" />
                  <Moon size={16} className="dark:hidden" />
                  <span className="dark:hidden">{t("dark")}</span>
                  <span className="hidden dark:inline">{t("light")}</span>
                </button>
                <label className="ws-language">
                  <Globe2 size={16} />
                  <select
                    aria-label="Language"
                    value={locale}
                    onChange={(e) =>
                      router.replace(path, { locale: e.target.value })
                    }
                  >
                    <option value="az">Azərbaycan</option>
                    <option value="en">English</option>
                    <option value="ru">Русский</option>
                  </select>
                </label>
                <button type="button" onClick={logout}>
                  <LogOut size={16} />
                  {t("signOut")}
                </button>
              </div>
            )}
            <button
              type="button"
              className="ws-account-trigger"
              aria-expanded={account}
              aria-label={t("accountMenu")}
              onClick={() => setAccount(!account)}
            >
              <span className="avatar">
                {user?.name?.slice(0, 1).toLocaleUpperCase(locale) || (
                  <UserRound size={16} />
                )}
              </span>
              <span className="ws-account-text">
                <strong>{user?.name}</strong>
                {user?.email && <span>{user.email}</span>}
              </span>
              <ChevronsUpDown size={15} />
            </button>
          </div>
        </div>
      </aside>
      {drawer && <div className="ws-scrim" onClick={close} />}
      {error && (
        <div className="notice error ws-error" role="alert">
          {t("loadError")}
        </div>
      )}
    </>
  );
}
