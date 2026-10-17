"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Plus } from "lucide-react";
import { Gate, Failure, PageHead, Status } from "@/components/ui/product";
import { useResource } from "@/hooks/useResource";
import { Link } from "@/lib/navigation";
import AddSiteForm from "@/components/publisher/AddSiteForm";
import { isLive, type Site } from "@/components/publisher/site";
function Content() {
  const t = useTranslations("product"),
    locale = useLocale();
  const [adding, setAdding] = useState(false);
  const sites = useResource<Site[]>("/sites");
  const numbers = new Intl.NumberFormat(locale);
  const list = sites.data ?? [];
  return (
    <div className="wrap page stack">
      <PageHead
        eyebrow={t("rolePublisher")}
        title={t("sites")}
        description={t("sitesIntro")}
      >
        {!!list.length && !adding && (
          <button className="btn-primary" onClick={() => setAdding(true)}>
            <Plus size={17} />
            {t("addSite")}
          </button>
        )}
      </PageHead>
      {sites.error ? (
        <Failure retry={sites.retry} />
      ) : sites.loading ? (
        <p role="status">{t("loading")}</p>
      ) : !list.length ? (
        <AddSiteForm />
      ) : (
        <>
          {adding && <AddSiteForm onCancel={() => setAdding(false)} />}
          <section className="list" aria-label={t("sites")}>
            <div className="list-head sites-grid" aria-hidden="true">
              <span>{t("siteColumn")}</span>
              <span>{t("status")}</span>
              <span>{t("placements")}</span>
              <span className="num">{t("trafficTotal")}</span>
              <span />
            </div>
            {list.map((s) => (
              <Link
                className="list-row sites-grid site-row"
                key={s.id}
                href={`/publisher/sites/${s.id}`}
              >
                <span className="list-main">
                  <span className="list-title">{s.name}</span>
                  <span className="list-sub">{s.host}</span>
                </span>
                <span className="list-cell list-status">
                  <Status value={s.status} />
                  <span className={`signal ${isLive(s) ? "on" : ""}`}>
                    {t(
                      isLive(s)
                        ? "siteLiveShort"
                        : s.verified_at
                          ? "siteAwaitingReview"
                          : "siteNeedsVerification",
                    )}
                  </span>
                </span>
                <span className="list-cell site-units">
                  {t("placementCount", { count: s.ad_units_count ?? 0 })}
                </span>
                <span className="list-cell num list-traffic">
                  <span>
                    <strong>{numbers.format(s.impressions_count ?? 0)}</strong>{" "}
                    {t("impressions")}
                  </span>
                  <span>
                    <strong>{numbers.format(s.clicks_count ?? 0)}</strong>{" "}
                    {t("clicks")}
                  </span>
                </span>
                <ArrowRight size={16} className="recent-arrow" />
              </Link>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
export default function Page() {
  return (
    <Gate>
      <Content />
    </Gate>
  );
}
