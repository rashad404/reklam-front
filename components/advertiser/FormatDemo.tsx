"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PanelsTopLeft, ArrowUpRight } from "lucide-react";
import AdPreview from "./AdPreview";
export default function FormatDemo() {
  const t = useTranslations("product"),
    locale = useLocale();
  const [format, setFormat] = useState("banner_300x250");
  return (
    <div className="ad-studio">
      <div className="studio-top">
        <div>
          <span className="studio-icon">
            <PanelsTopLeft size={19} />
          </span>
          <span>{t("formats")}</span>
        </div>
        <span className="studio-format">
          {format === "text" ? t("textFormat") : format.replace("banner_", "")}
        </span>
      </div>
      <div className={`studio-canvas studio-${format}`}>
        <div className="studio-ad">
          <AdPreview
            href={`${locale === "az" ? "" : `/${locale}`}/advertiser/campaigns/create`}
            ad={{
              ad_format: format,
              title: t("exampleTitle"),
              description: t("exampleText"),
              image_url:
                format === "text"
                  ? null
                  : `/images/reklam-ad-${locale}-${format.replace("banner_", "")}.svg`,
            }}
          />
        </div>
      </div>
      <div className="studio-bottom">
        <span className="studio-wordmark">
          reklam<span>.</span>biz
        </span>
        <ArrowUpRight size={20} />
      </div>
      <div className="format-options" aria-label={t("format")}>
        {["banner_300x250", "banner_728x90", "banner_320x50", "text"].map(
          (f) => (
            <button
              key={f}
              aria-pressed={f === format}
              onClick={() => setFormat(f)}
            >
              <span className={`format-shape shape-${f}`} aria-hidden="true" />
              {f === "text" ? t("textFormat") : f.replace("banner_", "")}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
