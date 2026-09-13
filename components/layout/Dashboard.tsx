"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { Gate, Notice, Failure } from "@/components/ui/product";
import { useResource } from "@/hooks/useResource";
import { useAuth } from "@/hooks/useAuth";
interface Overview {
  impressions: number;
  clicks: number;
  active_campaigns?: number;
  active_ad_units?: number;
}
function Content({ role }: { role: "advertiser" | "publisher" }) {
  const t = useTranslations("product");
  const { user } = useAuth();
  const registered = !!user?.[role];
  const resource = useResource<Overview>(
    registered ? `/${role}/dashboard` : null,
  );
  return (
    <div className="wrap page stack">
      <div>
        <span className="eyebrow">{user?.name}</span>
        <h1>{t(role)}</h1>
      </div>
      <p>{t(`${role}Description`)}</p>
      {registered && resource.error ? (
        <Failure retry={resource.retry} />
      ) : registered && resource.loading ? (
        <p>{t("loading")}</p>
      ) : registered && resource.data ? (
        <div className="metrics">
          {[
            ["impressions", resource.data.impressions],
            ["clicks", resource.data.clicks],
            [
              "active",
              resource.data.active_campaigns ??
                resource.data.active_ad_units ??
                0,
            ],
          ].map(([key, n]) => (
            <div className="metric" key={key}>
              <span>{t(String(key))}</span>
              <strong>{Number(n).toLocaleString()}</strong>
            </div>
          ))}
        </div>
      ) : null}
      <div className="two-col">
        {(role === "advertiser"
          ? [
              ["/advertiser/campaigns", "campaigns", "noCampaigns"],
              ["/advertiser/stats", "reports", "metricHelp"],
            ]
          : [
              ["/publisher/site", "site", "verificationHelp"],
              ["/publisher/ad-units", "placements", "noPlacements"],
            ]
        ).map(([href, title, body]) => (
          <Link href={href} className="card stack" key={href}>
            <h2>{t(title)}</h2>
            <p>{t(body)}</p>
            <span className="eyebrow">{t("next")} &rarr;</span>
          </Link>
        ))}
      </div>
      <Notice>{t("deliveryHint")}</Notice>
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
