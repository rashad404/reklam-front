"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import AdPreview from "./AdPreview";
export default function FormatDemo() {
  const t = useTranslations("product");
  const [format, setFormat] = useState("banner_300x250");
  return (
    <div className="demo-stage">
      <div className="demo-head">
        <span>{t("example")}</span>
        <span>{format.replace("banner_", "").toUpperCase()}</span>
      </div>
      <AdPreview
        ad={{
          ad_format: format,
          title: t("exampleTitle"),
          description: t("exampleText"),
          image_url:
            format === "text"
              ? null
              : `/images/example-${format.replace("banner_", "")}.svg`,
        }}
      />
      <div className="demo-tabs" aria-label={t("format")}>
        {["banner_300x250", "banner_728x90", "banner_320x50", "text"].map(
          (f) => (
            <button
              key={f}
              aria-pressed={f === format}
              onClick={() => setFormat(f)}
            >
              {f === "text" ? t("textFormat") : f.replace("banner_", "")}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
