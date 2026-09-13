"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
export default function Footer() {
  const t = useTranslations("product");
  return (
    <footer className="footer">
      <div className="wrap row between">
        <span className="muted">Reklam.biz</span>
        <nav className="row">
          {[
            ["/help", "help"],
            ["/privacy", "privacy"],
            ["/terms", "terms"],
          ].map(([href, key]) => (
            <Link key={href} href={href}>
              {t(key)}
            </Link>
          ))}
          <Link href="/settings/support">{t("support")}</Link>
        </nav>
      </div>
    </footer>
  );
}
