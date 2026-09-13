"use client";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
export interface CommissionOffer {
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  platform_percent: number;
  standard_platform_percent: number;
}
export default function PublisherOffer({
  compact = false,
  offer,
}: {
  compact?: boolean;
  offer?: CommissionOffer | null;
}) {
  const t = useTranslations("product");
  const locale = useLocale();
  const Heading = compact ? "h2" : "h3";
  const ended = !!offer?.ends_at && !offer.active;
  const end = offer?.ends_at
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "long",
        timeZone: "Asia/Baku",
      }).format(new Date(offer.ends_at))
    : null;
  return (
    <aside
      className={`publisher-offer ${compact ? "offer-compact" : ""}`}
      aria-label={t("offerLabel")}
    >
      <div className="offer-rate">
        <strong>
          {ended ? offer.platform_percent : 0}
          <span>%</span>
        </strong>
        <span>{t("offerCommissionLabel")}</span>
      </div>
      <div className="offer-copy">
        <Heading>
          {t(
            ended ? "offerEnded" : compact ? "offerTitle" : "offerPublicTitle",
          )}
        </Heading>
        <p>{t(ended ? "offerStandardBody" : "offerBody")}</p>
        {offer?.active && end ? (
          <p className="offer-dates">{t("offerEnds", { date: end })}</p>
        ) : (
          !ended && <p className="offer-dates">{t("offerStart")}</p>
        )}
        <p className="offer-fees">{t("offerFees")}</p>
        <Link href="/terms#publisher-offer">{t("offerTerms")}</Link>
      </div>
    </aside>
  );
}
