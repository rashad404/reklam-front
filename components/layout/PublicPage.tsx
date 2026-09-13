import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  ArrowUpRight,
  Megaphone,
  PanelsTopLeft,
  MousePointer2,
  BarChart3,
  Layers3,
  ShieldCheck,
} from "lucide-react";
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
    <div className="marketing">
      <div className="wrap">
        <section
          className={`hero ${kind === "home" ? "hero-home" : "hero-inner"}`}
        >
          <div className="hero-copy">
            <span className="eyebrow hero-kicker">
              <span />
              {t("platform")}
            </span>
            <h1>
              {kind === "home" ? (
                <>
                  {t("heroLine1")}
                  <span>{t("heroLine2")}</span>
                </>
              ) : (
                t(kind)
              )}
            </h1>
            <p>
              {t(kind === "home" ? "heroDescription" : `${kind}Description`)}
            </p>
            <div className="hero-actions">
              <Link
                className="btn-primary"
                href={
                  publisher ? "/publisher/site" : "/advertiser/campaigns/create"
                }
              >
                {t(publisher ? "joinWebsite" : "createCampaign")}
                <ArrowUpRight size={19} />
              </Link>
              <Link
                className="text-link"
                href={publisher ? "/help" : "/for-publishers"}
              >
                {t(publisher ? "help" : "navPublishers")}
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="hero-caption">
              <Layers3 size={16} />
              {t("bannerAndText")}
              <span className="caption-divider" />
              <BarChart3 size={16} />
              {t("reports")}
            </div>
          </div>
          <div className="hero-visual">
            <FormatDemo />
          </div>
        </section>
      </div>
      <div className="capability-band">
        <div className="wrap capability-grid">
          {[
            {
              icon: MousePointer2,
              title: "capCreative",
              body: "capCreativeBody",
            },
            { icon: ShieldCheck, title: "capControl", body: "capControlBody" },
            { icon: BarChart3, title: "capReports", body: "capReportsBody" },
          ].map(({ icon: Icon, title, body }) => (
            <div className="capability" key={title}>
              <span className="capability-icon">
                <Icon size={23} />
              </span>
              <div>
                <h2>{t(title)}</h2>
                <p>{t(body)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="wrap">
        {kind === "home" ? (
          <section className="audiences-section">
            <div className="section-heading">
              <span className="eyebrow">{t("platform")}</span>
              <h2>{t("audienceHeading")}</h2>
            </div>
            <div className="audience-grid">
              <article className="audience-panel advertiser-panel">
                <div className="audience-icon">
                  <Megaphone size={28} />
                </div>
                <h3>{t("navAdvertisers")}</h3>
                <p>{t("forAdvertisersDescription")}</p>
                <Link
                  className="btn-primary"
                  href="/advertiser/campaigns/create"
                >
                  {t("createCampaign")}
                  <ArrowUpRight size={18} />
                </Link>
                <div className="panel-orbit" aria-hidden="true" />
              </article>
              <article className="audience-panel publisher-panel">
                <div className="audience-icon">
                  <PanelsTopLeft size={28} />
                </div>
                <h3>{t("navPublishers")}</h3>
                <p>{t("forPublishersDescription")}</p>
                <Link className="btn-secondary" href="/publisher/site">
                  {t("joinWebsite")}
                  <ArrowUpRight size={18} />
                </Link>
                <div className="panel-grid-art" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </article>
            </div>
          </section>
        ) : (
          <section className="product-details">
            <div className="section-heading">
              <span className="eyebrow">{t(kind)}</span>
              <h2>
                {t(
                  publisher
                    ? "publicPublisherHeading"
                    : kind === "formats"
                      ? "formats"
                      : "publicAdvertiserHeading",
                )}
              </h2>
            </div>
            <div className="detail-grid">
              <div className="detail-copy">
                <h3>
                  {t(
                    publisher
                      ? "publicPublisherTitle"
                      : kind === "formats"
                        ? "content"
                        : "publicBudgetTitle",
                  )}
                </h3>
                <p>
                  {t(
                    publisher
                      ? "publicPublisherBody"
                      : kind === "formats"
                        ? "uploadHint"
                        : "publicBudgetBody",
                  )}
                </p>
                <h3>
                  {t(publisher ? "publicPlacementTitle" : "publicReportsTitle")}
                </h3>
                <p>
                  {t(publisher ? "publicPlacementBody" : "publicReportsBody")}
                </p>
              </div>
              <div className="detail-surface">
                {kind === "formats" ? (
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
                    <ShieldCheck size={32} />
                    <h3>
                      {t(
                        publisher
                          ? "publicPublisherCardTitle"
                          : "publicAdvertiserCardTitle",
                      )}
                    </h3>
                    <p>
                      {t(
                        publisher
                          ? "publicPublisherCardBody"
                          : "publicAdvertiserCardBody",
                      )}
                    </p>
                    <Link className="text-link" href="/help">
                      {t("help")}
                      <ArrowUpRight size={17} />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </section>
        )}
        <section className="process-section">
          <div className="section-heading">
            <span className="eyebrow">{t("process")}</span>
            <h2>{t("processHeading")}</h2>
          </div>
          <div className="process-grid">
            {[1, 2, 3].map((n) => (
              <article className="process-card" key={n}>
                <div className="process-top">
                  <span>0{n}</span>
                  <ArrowRight size={22} />
                </div>
                <h3>{t(`process${n}`)}</h3>
                <p>{t(`process${n}Body`)}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="closing-cta">
          <div>
            <span className="eyebrow">REKLAM.BIZ</span>
            <h2>{t("closingTitle")}</h2>
            <p>{t("closingBody")}</p>
          </div>
          <div className="closing-actions">
            <Link className="btn-primary" href="/advertiser/campaigns/create">
              {t("createCampaign")}
              <ArrowUpRight size={18} />
            </Link>
            <Link className="text-link" href="/publisher/site">
              {t("joinWebsite")}
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </div>
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
