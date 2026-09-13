"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Gate, Notice } from "@/components/ui/product";
import { useAuth } from "@/hooks/useAuth";
import { Link, useRouter } from "@/lib/navigation";
import api from "@/lib/api/client";
function Content() {
  const t = useTranslations("product"),
    { user } = useAuth(),
    router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError(false);
    try {
      await api.post("/ad-units", {
        name: fd.get("name"),
        ad_format: fd.get("format"),
        website_url: user?.publisher?.website_url,
      });
      router.push("/publisher/ad-units");
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="wrap page narrow stack">
      <h1>{t("createPlacement")}</h1>
      {!user?.publisher ? (
        <>
          <p>{t("noPlacements")}</p>
          <Link className="btn-primary" href="/publisher/site">
            {t("site")}
          </Link>
        </>
      ) : (
        <form className="card stack" onSubmit={submit}>
          {error && <Notice error>{t("saveError")}</Notice>}
          <p>{user.publisher.website_url}</p>
          <label className="field">
            {t("name")}
            <input name="name" required maxLength={120} />
          </label>
          <label className="field">
            {t("format")}
            <select name="format">
              {["banner_300x250", "banner_728x90", "banner_320x50", "text"].map(
                (f) => (
                  <option key={f} value={f}>
                    {f === "text" ? t("textFormat") : f.replace("banner_", "")}
                  </option>
                ),
              )}
            </select>
          </label>
          <Notice>{t("reviewHint")}</Notice>
          <button className="btn-primary" disabled={busy}>
            {t("save")}
          </button>
        </form>
      )}
    </div>
  );
}
export default function Page() {
  return (
    <Gate>
      <Content />
    </Gate>
  );
}
