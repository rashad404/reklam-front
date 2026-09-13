"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/lib/navigation";
export default function Footer() {
  const t = useTranslations("product");
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
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
            <p>{t("footerLine")}</p>
          </div>
          <nav aria-label={t("platform")}>
            <strong>{t("platform")}</strong>
            {[
              ["/for-advertisers", "navAdvertisers"],
              ["/for-publishers", "navPublishers"],
              ["/ad-formats", "formats"],
            ].map(([href, key]) => (
              <Link href={href} key={href}>
                {t(key)}
                <ArrowUpRight size={14} />
              </Link>
            ))}
          </nav>
          <nav aria-label={t("help")}>
            <strong>{t("help")}</strong>
            {[
              ["/help", "help"],
              ["/settings/support", "support"],
              ["/privacy", "privacy"],
              ["/terms", "terms"],
            ].map(([href, key]) => (
              <Link href={href} key={href}>
                {t(key)}
              </Link>
            ))}
          </nav>
        </div>
        <div className="footer-bottom">
          <span>{new Date().getFullYear()} Reklam.biz</span>
          <div>
            <Link href="/privacy">{t("privacy")}</Link>
            <Link href="/terms">{t("terms")}</Link>
            <Link href="/settings/support">{t("support")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
