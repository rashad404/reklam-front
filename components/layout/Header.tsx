"use client";
import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, X, LogIn } from "lucide-react";
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
  const links = [
    ["/for-advertisers", "forAdvertisers"],
    ["/for-publishers", "forPublishers"],
    ["/ad-formats", "formats"],
  ];
  const workspace = /^\/(advertiser|publisher|settings|admin)(\/|$)/.test(path);
  const role = path.startsWith("/publisher")
    ? "publisher"
    : path.startsWith("/admin")
      ? "admin"
      : "advertiser";
  const tabs =
    role === "publisher"
      ? [
          ["/publisher", "overview"],
          ["/publisher/site", "site"],
          ["/publisher/ad-units", "placements"],
          ["/publisher/stats", "reports"],
        ]
      : role === "admin"
        ? [
            ["/admin", "overview"],
            ["/admin/ads", "campaigns"],
            ["/admin/publishers", "site"],
            ["/admin/support", "support"],
          ]
        : [
            ["/advertiser", "overview"],
            ["/advertiser/campaigns", "campaigns"],
            ["/advertiser/stats", "reports"],
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
      <header className="site-header">
        <div className="wrap header-inner">
          <Link href="/" aria-label="Reklam.biz">
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
          <nav className="header-nav" aria-label={t("menu")}>
            {links.map(([href, key]) => (
              <Link
                key={href}
                href={href}
                aria-current={path === href ? "page" : undefined}
              >
                {t(key)}
              </Link>
            ))}
          </nav>
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
              className="btn-quiet"
              aria-label={t(resolvedTheme === "dark" ? "light" : "dark")}
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              <Sun size={18} className="hidden dark:block" />
              <Moon size={18} className="dark:hidden" />
            </button>
            {isAuthenticated ? (
              <Link className="btn-secondary" href="/advertiser/campaigns">
                {t("campaigns")}
              </Link>
            ) : (
              <button
                className="btn-primary"
                aria-label={t("signIn")}
                onClick={login}
              >
                <LogIn size={16} />
                <span className="sign-in-label">{t("signIn")}</span>
              </button>
            )}
            <button
              className="btn-quiet mobile-toggle"
              aria-label={t(menu ? "close" : "menu")}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={21} /> : <Menu size={21} />}
            </button>
            {isAuthenticated && (
              <button
                className="btn-quiet hidden min-[851px]:inline-flex"
                aria-label={t("menu")}
                aria-expanded={menu}
                onClick={() => setMenu(!menu)}
              >
                <Menu size={20} />
              </button>
            )}
          </div>
        </div>
        {menu && (
          <nav className="mobile-nav" aria-label={t("menu")}>
            {links.map(([href, key]) => (
              <Link key={href} href={href} onClick={() => setMenu(false)}>
                {t(key)}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <Link href="/advertiser" onClick={() => setMenu(false)}>
                  {t("advertiser")}
                </Link>
                <Link href="/publisher" onClick={() => setMenu(false)}>
                  {t("publisher")}
                </Link>
                <Link href="/settings" onClick={() => setMenu(false)}>
                  {t("settings")}
                </Link>
                {user?.is_admin && (
                  <Link href="/admin" onClick={() => setMenu(false)}>
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
      {workspace && isAuthenticated && (
        <nav className="workspace-nav" aria-label={t(role)}>
          <div className="wrap row">
            {tabs.map(([href, key]) => (
              <Link
                href={href}
                key={href}
                aria-current={path === href ? "page" : undefined}
              >
                {t(key)}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
