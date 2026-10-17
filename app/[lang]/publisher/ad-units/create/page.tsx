"use client";
import { use, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Gate, Notice, Failure, PageHead } from "@/components/ui/product";
import { useResource } from "@/hooks/useResource";
import { Link, useRouter } from "@/lib/navigation";
import AddSiteForm from "@/components/publisher/AddSiteForm";
import type { Site } from "@/components/publisher/site";
import api from "@/lib/api/client";
const formats = ["banner_300x250", "banner_728x90", "banner_320x50", "text"];
function Content({ preset }: { preset: number }) {
  const t = useTranslations("product"),
    router = useRouter();
  const sites = useResource<Site[]>("/sites");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(false);
  const list = sites.data ?? [];
  const initial = list.some((s) => s.id === preset) ? preset : list[0]?.id;
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const site = Number(fd.get("site"));
    setBusy(true);
    setError(false);
    try {
      await api.post("/ad-units", {
        name: fd.get("name"),
        ad_format: fd.get("format"),
        site_id: site,
      });
      router.push(`/publisher/sites/${site}`);
    } catch {
      setError(true);
      setBusy(false);
    }
  }
  return (
    <div className="wrap page narrow stack">
      <Link
        className="back-link"
        href={preset ? `/publisher/sites/${preset}` : "/publisher/sites"}
      >
        <ArrowLeft size={16} />
        {t("sites")}
      </Link>
      <PageHead
        title={t("createPlacement")}
        description={t("createPlacementIntro")}
      />
      {sites.error ? (
        <Failure retry={sites.retry} />
      ) : sites.loading ? (
        <p role="status">{t("loading")}</p>
      ) : !list.length ? (
        <AddSiteForm />
      ) : (
        <form className="card stack" onSubmit={submit} key={initial}>
          {error && <Notice error>{t("saveError")}</Notice>}
          <label className="field">
            {t("siteColumn")}
            <select name="site" defaultValue={initial}>
              {list.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.host})
                </option>
              ))}
            </select>
          </label>
          <div className="field">
            <label htmlFor="placement-name">{t("name")}</label>
            <input
              id="placement-name"
              name="name"
              required
              maxLength={120}
              aria-describedby="placement-name-hint"
            />
            <small id="placement-name-hint">{t("placementNameHint")}</small>
          </div>
          <label className="field">
            {t("format")}
            <select name="format">
              {formats.map((f) => (
                <option key={f} value={f}>
                  {f === "text" ? t("textFormat") : f.replace("banner_", "")}
                </option>
              ))}
            </select>
          </label>
          <div>
            <button className="btn-primary" disabled={busy}>
              {busy ? t("loading") : t("save")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ site?: string }>;
}) {
  const { site } = use(searchParams);
  return (
    <Gate>
      <Content preset={Number(site) || 0} />
    </Gate>
  );
}
