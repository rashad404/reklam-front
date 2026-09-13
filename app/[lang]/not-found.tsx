import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
export default async function NotFound() {
  const t = await getTranslations("product");
  return (
    <div className="wrap page stack">
      <h1>{t("notFound")}</h1>
      <Link href="/" className="btn-secondary">
        {t("returnHome")}
      </Link>
    </div>
  );
}
