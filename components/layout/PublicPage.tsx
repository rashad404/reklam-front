import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import FormatDemo from "@/components/advertiser/FormatDemo";
import { site } from "@/lib/seo";
export default async function PublicPage({
  kind = "home",
}: {
  kind?: "home" | "forAdvertisers" | "forPublishers" | "formats";
}) {
  const t = await getTranslations("product");
  const publisher = kind === "forPublishers";
  return (
    <div className="wrap">
      <section className="hero">
        <div>
          <span className="eyebrow">REKLAM.BIZ</span>
          <h1>{t(kind)}</h1>
          <p>{t(`${kind}Description`)}</p>
          <div className="row">
            <Link
              className="btn-primary"
              href={
                publisher ? "/publisher/site" : "/advertiser/campaigns/create"
              }
            >
              {t(publisher ? "createPlacement" : "createCampaign")}
            </Link>
            <Link
              className="btn-secondary"
              href={publisher ? "/help" : "/for-publishers"}
            >
              {t(publisher ? "help" : "forPublishers")}
            </Link>
          </div>
        </div>
        <FormatDemo />
      </section>
      {kind !== "home" && (
        <section className="section stack">
          <h2>
            {t(
              publisher
                ? "verification"
                : kind === "formats"
                  ? "format"
                  : "content",
            )}
          </h2>
          <p>{t(publisher ? "verificationHelp" : "uploadHint")}</p>
          {publisher ? (
            <>
              <h3>{t("embed")}</h3>
              <p>{t("embedHelp")}</p>
              <p>{t("reviewHint")}</p>
            </>
          ) : kind === "formats" ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t("format")}</th>
                    <th>{t("content")}</th>
                  </tr>
                </thead>
                <tbody>
                  {["300x250", "728x90", "320x50"].map((size) => (
                    <tr key={size}>
                      <th scope="row">{size}</th>
                      <td>PNG / JPEG / WebP</td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row">{t("textFormat")}</th>
                    <td>
                      {t("adTitle")} + {t("adText")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <h3>{t("budget")}</h3>
              <p>{t("timezone")}</p>
              <p>{t("reviewHint")}</p>
              <h3>{t("reports")}</h3>
              <p>{t("metricHelp")}</p>
            </>
          )}
        </section>
      )}
      <section className="section">
        <div className="two-col">
          <div className="audience">
            <span className="eyebrow">01</span>
            <h2>{t("forAdvertisers")}</h2>
            <p>{t("forAdvertisersDescription")}</p>
            <Link className="btn-secondary" href="/advertiser/campaigns/create">
              {t("createCampaign")}
            </Link>
          </div>
          <div className="audience">
            <span className="eyebrow">02</span>
            <h2>{t("forPublishers")}</h2>
            <p>{t("forPublishersDescription")}</p>
            <Link className="btn-secondary" href="/publisher/site">
              {t("site")}
            </Link>
          </div>
        </div>
      </section>
      <section className="section">
        <h2>{t("process")}</h2>
        {[1, 2, 3].map((n) => (
          <div className="process-row" key={n}>
            <span className="process-number">0{n}</span>
            <h3>{t(`process${n}`)}</h3>
            <p>{t(`process${n}Body`)}</p>
          </div>
        ))}
      </section>
      <section className="section stack">
        <h2>{t("contact")}</h2>
        <p>{t("contactBody")}</p>
        <div>
          <Link className="btn-secondary" href="/settings/support">
            {t("support")}
          </Link>
        </div>
      </section>
      {kind === "home" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${site}/#organization`,
                  name: "Reklam.biz",
                  url: site,
                  logo: `${site}/images/logo.svg`,
                },
                {
                  "@type": "WebSite",
                  name: "Reklam.biz",
                  url: site,
                  publisher: { "@id": `${site}/#organization` },
                },
              ],
            }),
          }}
        />
      )}
    </div>
  );
}
