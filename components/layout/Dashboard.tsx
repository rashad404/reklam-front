"use client";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowUpRight,
  Eye,
  MousePointer2,
  Layers3,
  Megaphone,
  BarChart3,
  Globe2,
  PanelsTopLeft,
  ShieldCheck,
} from "lucide-react";
import PublisherOffer from "@/components/publisher/PublisherOffer";
import { Link } from "@/lib/navigation";
import { Gate, Failure } from "@/components/ui/product";
import { useResource } from "@/hooks/useResource";
import { useAuth } from "@/hooks/useAuth";
interface Overview {
  impressions: number;
  clicks: number;
  active_campaigns?: number;
  active_ad_units?: number;
}
function Content({ role }: { role: "advertiser" | "publisher" }) {
  const t = useTranslations("product"),
    locale = useLocale();
  const { user } = useAuth();
  const registered = !!user?.[role];
  const resource = useResource<Overview>(
    registered ? `/${role}/dashboard` : null,
  );
  const publisher = role === "publisher";
  const cards = publisher
    ? [
        {
          href: "/publisher/site",
          title: "site",
          body: "siteManagementBody",
          icon: Globe2,
        },
        {
          href: "/publisher/ad-units",
          title: "placements",
          body: "placementManagementBody",
          icon: PanelsTopLeft,
        },
      ]
    : [
        {
          href: "/advertiser/campaigns",
          title: "campaigns",
          body: "campaignManagementBody",
          icon: Megaphone,
        },
        {
          href: "/advertiser/stats",
          title: "reports",
          body: "reportManagementBody",
          icon: BarChart3,
        },
      ];
  return (
    <div className="wrap page stack">
      <div className="dashboard-lead">
        <div>
          <span className="eyebrow">{user?.name}</span>
          <h1>{t("overview")}</h1>
          <p>{t(`${role}Description`)}</p>
        </div>
        <Link
          className="btn-primary"
          href={
            publisher
              ? "/publisher/ad-units/create"
              : "/advertiser/campaigns/create"
          }
        >
          {t(publisher ? "createPlacement" : "createCampaign")}
          <ArrowUpRight size={18} />
        </Link>
      </div>
      {registered && resource.error ? (
        <Failure retry={resource.retry} />
      ) : registered && resource.loading ? (
        <p role="status">{t("loading")}</p>
      ) : registered && resource.data ? (
        <div className="metrics">
          {[
            { key: "impressions", n: resource.data.impressions, icon: Eye },
            { key: "clicks", n: resource.data.clicks, icon: MousePointer2 },
            {
              key: "active",
              n:
                resource.data.active_campaigns ??
                resource.data.active_ad_units ??
                0,
              icon: Layers3,
            },
          ].map(({ key, n, icon: Icon }) => (
            <div className="metric" key={key}>
              <div className="metric-top">
                <span>{t(key)}</span>
                <Icon size={21} />
              </div>
              <strong>{Number(n).toLocaleString(locale)}</strong>
            </div>
          ))}
        </div>
      ) : null}
      {publisher && (
        <PublisherOffer compact offer={user?.publisher?.commission_offer} />
      )}
      <div className="two-col">
        {cards.map(({ href, title, body, icon: Icon }) => (
          <Link href={href} className="card action-card" key={href}>
            <span className="action-icon">
              <Icon size={21} />
            </span>
            <div>
              <h2>{t(title)}</h2>
              <p>{t(body)}</p>
            </div>
            <ArrowUpRight size={18} />
          </Link>
        ))}
      </div>
      <p className="dashboard-note">
        <ShieldCheck size={17} />
        {t("deliveryHint")}
      </p>
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
