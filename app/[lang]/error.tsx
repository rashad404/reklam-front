"use client";
import { useTranslations } from "next-intl";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations("product");
  return (
    <div className="wrap page">
      <h1>{t("loadError")}</h1>
      <button className="btn-primary" onClick={reset}>
        {t("retry")}
      </button>
    </div>
  );
}
