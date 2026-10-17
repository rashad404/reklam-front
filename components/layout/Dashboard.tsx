"use client";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowRight,
  Check,
  Plus,
  BarChart3,
  Layers3,
  CircleHelp,
} from "lucide-react";
import PublisherOffer from "@/components/publisher/PublisherOffer";
import { Link } from "@/lib/navigation";
import {
  Gate,
  Failure,
  PageHead,
  Status,
  FormatGlyph,
} from "@/components/ui/product";
import { useResource } from "@/hooks/useResource";
import { useAuth } from "@/hooks/useAuth";
interface Overview {
  impressions: number;
  clicks: number;
  active_campaigns?: number;
  active_ad_units?: number;
}
interface Item {
  id: number;
  name: string;
  status: string;
  ad_format?: string;
  last_seen_at?: string | null;
  ads?: { id: number; ad_format: string; status?: string }[];
  impressions_count?: number;
  clicks_count?: number;
}
function Content({ role }: { role: "advertiser" | "publisher" }) {
  const t = useTranslations("product"),
    locale = useLocale();
  const { user } = useAuth();
  const publisher = role === "publisher";
  const registered = !!user?.[role];
  const overview = useResource<Overview>(
    registered ? `/${role}/dashboard` : null,
  );
  const items = useResource<{ data: Item[]; total: number }>(
    registered ? (publisher ? "/ad-units?page=1" : "/campaigns?page=1") : null,
  );
  const numbers = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const list = items.data?.data ?? [],
    total = items.data?.total ?? 0,
    stats = overview.data;
  const site = user?.publisher;
  const steps = publisher
    ? [
        { done: !!site, label: "stepRegisterSite", href: "/publisher/site" },
        {
          done: site?.status === "approved",
          label: "stepSiteApproved",
          href: "/publisher/site",
        },
        {
          done: !!site?.verified_at,
          label: "stepVerifySite",
          href: "/publisher/site",
        },
        {
          done: total > 0,
          label: "stepCreatePlacement",
          href: "/publisher/ad-units/create",
        },
        {
          done: list.some((u) => u.last_seen_at),
          label: "stepInstallCode",
          href: "/publisher/ad-units",
        },
      ]
    : [
        {
          done: total > 0,
          label: "stepCreateCampaign",
          href: "/advertiser/campaigns/create",
        },
        {
          done: list.some((c) => c.ads?.some((a) => a.status === "approved")),
          label: "stepAdApproved",
          href: "/advertiser/campaigns",
        },
        {
          done: (stats?.active_campaigns ?? 0) > 0,
          label: "stepActivateCampaign",
          href: "/advertiser/campaigns",
        },
      ];
  const doneCount = steps.filter((s) => s.done).length,
    nextStep = steps.find((s) => !s.done);
  const ready = !registered || (!overview.loading && !items.loading);
  const ctr =
    stats && stats.impressions ? (stats.clicks / stats.impressions) * 100 : 0;
  return (
    <div className="wrap page stack">
      <PageHead
        eyebrow={t(publisher ? "rolePublisher" : "roleAdvertiser")}
        title={
          user?.name
            ? t("greeting", { name: user.name.split(" ")[0] })
            : t("overview")
        }
        description={t(`${role}Description`)}
      >
        <Link
          className="btn-primary"
          href={
            publisher
              ? "/publisher/ad-units/create"
              : "/advertiser/campaigns/create"
          }
        >
          <Plus size={17} />
          {t(publisher ? "createPlacement" : "createCampaign")}
        </Link>
      </PageHead>
      {registered && overview.error ? (
        <Failure retry={overview.retry} />
      ) : registered && !stats ? (
        <p role="status">{t("loading")}</p>
      ) : stats ? (
        <div className="kpi-row">
          {[
            ["impressions", numbers.format(stats.impressions)],
            ["clicks", numbers.format(stats.clicks)],
            ["ctr", `${numbers.format(ctr)}%`],
            [
              publisher ? "activePlacements" : "activeCampaigns",
              numbers.format(
                stats.active_campaigns ?? stats.active_ad_units ?? 0,
              ),
            ],
          ].map(([key, value]) => (
            <div className="kpi" key={key}>
              <span>{t(key)}</span>
              <strong>{value}</strong>
            </div>
          ))}
          <p className="kpi-note text-sm">{t("allTimeNote")}</p>
        </div>
      ) : null}
      <div className="overview-grid">
        <section className="list" aria-labelledby="recent-heading">
          <div className="list-toolbar">
            <h2 id="recent-heading">
              {t(publisher ? "placements" : "campaigns")}
              {total > 0 && <span className="count">{total}</span>}
            </h2>
            {total > 0 && (
              <Link
                className="text-link"
                href={
                  publisher ? "/publisher/ad-units" : "/advertiser/campaigns"
                }
              >
                {t("viewAll")}
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
          {items.error ? (
            <div className="list-panel">
              <Failure retry={items.retry} />
            </div>
          ) : registered && items.loading ? (
            <p className="list-panel" role="status">
              {t("loading")}
            </p>
          ) : !list.length ? (
            <div className="list-empty">
              <p>{t(publisher ? "noPlacementsBody" : "noCampaignsShort")}</p>
              <Link
                className="btn-secondary btn-sm"
                href={
                  publisher
                    ? site
                      ? "/publisher/ad-units/create"
                      : "/publisher/site"
                    : "/advertiser/campaigns/create"
                }
              >
                <Plus size={16} />
                {t(
                  publisher
                    ? site
                      ? "createPlacement"
                      : "registerSite"
                    : "createCampaign",
                )}
              </Link>
            </div>
          ) : (
            list.slice(0, 5).map((item) => (
              <Link
                className="list-row recent-row"
                key={item.id}
                href={
                  publisher
                    ? `/publisher/stats?unit=${item.id}`
                    : `/advertiser/stats/${item.id}`
                }
              >
                <span className="list-main">
                  <span className="list-title">{item.name}</span>
                  <span className="recent-formats">
                    {publisher && item.ad_format ? (
                      <FormatGlyph format={item.ad_format} />
                    ) : (
                      [...new Set(item.ads?.map((a) => a.ad_format))].map(
                        (f) => <FormatGlyph format={f} key={f} />,
                      )
                    )}
                  </span>
                </span>
                <Status value={item.status} />
                <span className="num recent-traffic">
                  <strong>{numbers.format(item.impressions_count ?? 0)}</strong>
                  <span>{t("impressions")}</span>
                </span>
                <ArrowRight size={16} className="recent-arrow" />
              </Link>
            ))
          )}
        </section>
        <aside className="stack overview-side">
          {ready && nextStep ? (
            <section className="card setup">
              <div className="row between">
                <h2>{t("nextSteps")}</h2>
                <span className="text-sm muted">
                  {doneCount}/{steps.length}
                </span>
              </div>
              <div
                className="setup-progress"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={steps.length}
                aria-valuenow={doneCount}
                aria-label={t("nextSteps")}
              >
                <span
                  style={{ width: `${(doneCount / steps.length) * 100}%` }}
                />
              </div>
              <ol className="setup-list">
                {steps.map((s) => (
                  <li
                    key={s.label}
                    className={
                      s.done ? "done" : s === nextStep ? "current" : undefined
                    }
                  >
                    <span className="setup-mark" aria-hidden="true">
                      {s.done && <Check size={13} strokeWidth={3} />}
                    </span>
                    {s === nextStep ? (
                      <Link href={s.href}>{t(s.label)}</Link>
                    ) : (
                      <span>{t(s.label)}</span>
                    )}
                    <span className="sr-only">
                      {t(s.done ? "stepDone" : "stepTodo")}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ) : ready ? (
            <nav className="card shortcuts" aria-label={t("shortcuts")}>
              <h2>{t("shortcuts")}</h2>
              <Link href={publisher ? "/publisher/stats" : "/advertiser/stats"}>
                <BarChart3 size={18} />
                {t("reports")}
              </Link>
              <Link href="/ad-formats">
                <Layers3 size={18} />
                {t("formats")}
              </Link>
              <Link href="/help">
                <CircleHelp size={18} />
                {t("helpShort")}
              </Link>
            </nav>
          ) : null}
          {publisher && (
            <PublisherOffer compact offer={site?.commission_offer} />
          )}
        </aside>
      </div>
    </div>
  );
}
export default function Dashboard({
  role,
}: {
  role: "advertiser" | "publisher";
}) {
  return (
    <Gate>
      <Content role={role} />
    </Gate>
  );
}
