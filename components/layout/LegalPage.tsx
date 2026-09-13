import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
export default async function LegalPage({
  kind,
}: {
  kind: "privacy" | "terms";
}) {
  const t = await getTranslations(kind);
  const product = await getTranslations("product");
  const groups =
    kind === "privacy"
      ? [
          ["dataCollection", "dataCollectionDesc"],
          ["dataUsage", "dataUsageDesc"],
          ["cookies", "cookiesDesc"],
          ["thirdParty", "thirdPartyDesc"],
        ]
      : [
          ["generalTitle", "general1", "general2", "general3"],
          ["advertiserTitle", "advertiser1", "advertiser2", "advertiser3"],
          [
            "publisherTitle",
            "publisher1",
            "publisher2",
            "publisher3",
            "publisher4",
          ],
          ["fraudTitle", "fraudDesc"],
        ];
  return (
    <div className="wrap page narrow stack legal-page">
      <h1>{t("title")}</h1>
      <p>{t("intro")}</p>
      {groups.map(([heading, ...body]) => (
        <section className="card stack" key={heading}>
          <h2>{t(heading)}</h2>
          {body.map((key) => (
            <p key={key}>{t(key)}</p>
          ))}
        </section>
      ))}
      <p>{t("contact")}</p>
      <Link className="btn-secondary" href="/settings/support">
        {product("support")}
      </Link>
    </div>
  );
}
