"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
export interface Creative {
  id?: number;
  title: string;
  description?: string | null;
  image_url?: string | null;
  destination_url?: string;
  ad_format: string;
  status?: string;
  review_reason?: string | null;
}
declare global {
  interface Window {
    ReklamRenderer?: {
      render: (
        container: HTMLElement,
        ad: Creative,
        options: { preview: boolean; label: string },
      ) => void;
    };
  }
}
let rendererReady: Promise<void> | undefined;
export default function AdPreview({ ad }: { ad: Creative }) {
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations("product");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    if (!rendererReady)
      rendererReady = new Promise((resolve, reject) => {
        if (window.ReklamRenderer) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "/ad-renderer.js";
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
      });
    rendererReady
      .then(() => {
        if (alive && ref.current)
          window.ReklamRenderer?.render(ref.current, ad, {
            preview: true,
            label: t("adLabel"),
          });
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [ad, t]);
  return failed ? (
    <p role="alert">{t("loadError")}</p>
  ) : (
    <div
      ref={ref}
      style={{ minHeight: ad.ad_format === "text" ? 130 : 50 }}
      aria-label={t("preview")}
    />
  );
}
