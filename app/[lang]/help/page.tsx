import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
export default async function Help() {
  const t = await getTranslations("product");
  return (
    <div className="wrap page narrow stack">
      <h1>{t("help")}</h1>
      <p>{t("helpDescription")}</p>
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
      <p>{t("timezone")}</p>
      <div className="row">
        <Link href="/ad-formats" className="btn-secondary">
          {t("formats")}
        </Link>
        <Link href="/publisher/site" className="btn-secondary">
          {t("site")}
        </Link>
      </div>
      <section className="card stack">
        <h2>{t("contact")}</h2>
        <p>{t("contactBody")}</p>
        <Link className="btn-primary" href="/settings/support">
          {t("support")}
        </Link>
      </section>
    </div>
  );
}
