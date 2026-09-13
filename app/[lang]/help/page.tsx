import { getTranslations } from "next-intl/server";
import { LifeBuoy, ArrowUpRight } from "lucide-react";
import { Link } from "@/lib/navigation";
export default async function Help() {
  const t = await getTranslations("product");
  return (
    <div className="wrap page">
      <div className="help-head">
        <span className="eyebrow">REKLAM.BIZ</span>
        <h1>{t("help")}</h1>
        <p>{t("helpDescription")}</p>
      </div>
      <div className="help-layout">
        <div>
          {[
            ["process1", "uploadHint"],
            ["process2", "reviewHint"],
            ["verification", "verificationHelp"],
            ["embed", "embedHelp"],
            ["reports", "metricHelp"],
            ["budget", "deliveryHint"],
          ].map(([h, b]) => (
            <details key={h} open>
              <summary>{t(h)}</summary>
              <p>{t(b)}</p>
            </details>
          ))}
          <p className="mt-6 text-sm">{t("timezone")}</p>
          <div className="row mt-6">
            <Link href="/ad-formats" className="btn-secondary">
              {t("formats")}
            </Link>
            <Link href="/publisher/site" className="btn-secondary">
              {t("site")}
            </Link>
          </div>
        </div>
        <aside className="help-side">
          <LifeBuoy size={28} />
          <h2>{t("contact")}</h2>
          <p>{t("contactBody")}</p>
          <Link className="btn-primary" href="/settings/support">
            {t("support")}
            <ArrowUpRight size={18} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
