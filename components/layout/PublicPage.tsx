import { getTranslations } from "next-intl/server";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
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
  const advertiserStory = (
    <section
      className="audience-story"
      aria-labelledby="advertiser-story-title"
    >
      <div className="story-intro">
        <span className="story-label">{t("navAdvertisers")}</span>
        <h2 id="advertiser-story-title">{t("advertiserStoryTitle")}</h2>
        <p>{t("advertiserStoryBody")}</p>
        <Link className="text-link" href="/advertiser/campaigns/create">
          {t("createCampaign")}
          <ArrowUpRight size={19} />
        </Link>
      </div>
      <dl className="market-facts">
        <div>
          <dt>{t("publicBudgetTitle")}</dt>
          <dd>{t("publicBudgetBody")}</dd>
        </div>
        <div>
          <dt>{t("publicReportsTitle")}</dt>
          <dd>{t("publicReportsBody")}</dd>
        </div>
      </dl>
    </section>
  );
  const publisherStory = (
    <section
      className="publisher-story"
      aria-labelledby="publisher-story-title"
    >
      <div className="story-intro">
        <span className="story-label">{t("navPublishers")}</span>
        <h2 id="publisher-story-title">{t("publisherStoryTitle")}</h2>
        <p>{t("publisherStoryBody")}</p>
        <Link className="btn-primary" href="/publisher/site">
          {t("joinWebsite")}
          <ArrowUpRight size={19} />
        </Link>
      </div>
      <div className="publisher-notes">
        <p>{t("publisherPlacementNote")}</p>
        <div className="publisher-format-list" aria-label={t("formats")}>
          <span>300x250</span>
          <span>728x90</span>
          <span>320x50</span>
          <span>{t("textFormat")}</span>
        </div>
        <Link className="text-link" href="/ad-formats">
          {t("viewFormats")}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
  return (
    <div className="marketing">
      <div className="wrap">
        <section
          className={`hero ${kind === "home" ? "hero-home" : "hero-inner"}`}
        >
          <div className="hero-copy">
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
                href={publisher ? "/ad-formats" : "/for-publishers"}
              >
                {t(publisher ? "viewFormats" : "navPublishers")}
                <ArrowRight size={18} />
              </Link>
            </div>
            <p className="hero-footnote">{t("heroFootnote")}</p>
          </div>
          <div className="hero-visual">
            <FormatDemo />
          </div>
        </section>
        {kind === "home" && (
          <>
            {advertiserStory}
            {publisherStory}
          </>
        )}
        {kind === "forAdvertisers" && advertiserStory}
        {kind === "forPublishers" && publisherStory}
        {kind === "formats" && (
          <section className="format-specifications">
            <div className="story-intro">
              <span className="story-label">{t("formats")}</span>
              <h2>{t("formatChoiceTitle")}</h2>
              <p>{t("formatChoiceBody")}</p>
            </div>
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
          </section>
        )}
        <section className="market-faq" aria-labelledby="market-faq-title">
          <div>
            <h2 id="market-faq-title">{t("beforeJoining")}</h2>
            <Link className="text-link" href="/help">
              {t("help")}
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="market-questions">
            {(publisher
              ? [3, 4]
              : kind === "forAdvertisers" || kind === "formats"
                ? [1, 2]
                : [1, 2, 3]
            ).map((n) => (
              <details key={n}>
                <summary>
                  {t(`marketQuestion${n}`)}
                  <Plus size={18} aria-hidden="true" />
                </summary>
                <p>{t(`marketAnswer${n}`)}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="market-signoff">
          <p>{t(publisher ? "publisherSignoff" : "advertiserSignoff")}</p>
          <Link
            className="btn-primary"
            href={
              publisher ? "/publisher/site" : "/advertiser/campaigns/create"
            }
          >
            {t(publisher ? "joinWebsite" : "createCampaign")}
            <ArrowUpRight size={19} />
          </Link>
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
