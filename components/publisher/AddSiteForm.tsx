"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Notice } from "@/components/ui/product";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "@/lib/navigation";
import api from "@/lib/api/client";
import axios from "axios";
export default function AddSiteForm({ onCancel }: { onCancel?: () => void }) {
  const t = useTranslations("product"),
    router = useRouter(),
    { refresh } = useAuth();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const r = await api.post("/sites", {
        name: fd.get("name"),
        url: fd.get("url"),
      });
      await refresh();
      router.push(`/publisher/sites/${r.data.data.id}`);
    } catch (err) {
      setError(
        axios.isAxiosError(err) && err.response?.status === 422
          ? t("siteExists")
          : t("saveError"),
      );
      setBusy(false);
    }
  }
  return (
    <form className="card add-site" onSubmit={submit}>
      <h2>{t("addSite")}</h2>
      <p className="text-sm">{t("addSiteHelp")}</p>
      {error && <Notice error>{error}</Notice>}
      <div className="add-site-fields">
        <label className="field">
          {t("websiteName")}
          <input name="name" maxLength={120} required autoFocus />
        </label>
        <label className="field">
          {t("websiteUrl")}
          <input
            name="url"
            type="url"
            pattern="https?://.*"
            placeholder="https://example.az"
            required
          />
        </label>
      </div>
      <div className="row">
        <button className="btn-primary" disabled={busy}>
          {busy ? t("loading") : t("addSite")}
        </button>
        {onCancel && (
          <button type="button" className="btn-quiet" onClick={onCancel}>
            {t("cancel")}
          </button>
        )}
      </div>
    </form>
  );
}
