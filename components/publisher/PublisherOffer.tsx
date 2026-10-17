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
// Browsers lack Azerbaijani month names and print "2027 M03 13" for az.
// Russian long dates end with "г.", which doubles the sentence's final period.
const azMonths = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avqust",
  "sentyabr",
  "oktyabr",
  "noyabr",
  "dekabr",
];
function formatDate(value: string, locale: string) {
  const date = new Date(value);
  if (locale !== "az")
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
      timeZone: "Asia/Baku",
    })
      .format(date)
      .replace(/\s*г\.$/, "");
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone: "Asia/Baku",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.day} ${azMonths[Number(parts.month) - 1]} ${parts.year}`;
}
export default function PublisherOffer({
  compact = false,
  primary = false,
  offer,
}: {
  compact?: boolean;
  primary?: boolean;
  offer?: CommissionOffer | null;
}) {
  const t = useTranslations("product");
  const locale = useLocale();
  const Heading = compact || primary ? "h2" : "h3";
  const ended = !!offer?.ends_at && !offer.active;
  const end = offer?.ends_at ? formatDate(offer.ends_at, locale) : null;
  return (
    <aside
      className={`publisher-offer ${compact ? "offer-compact" : ""} ${primary ? "offer-poster" : ""}`}
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
        {!primary && (
          <>
            <Heading>
              {t(
                ended
                  ? "offerEnded"
                  : compact
                    ? "offerTitle"
                    : "offerPublicTitle",
              )}
            </Heading>
            <p>{t(ended ? "offerStandardBody" : "offerBody")}</p>
          </>
        )}
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
