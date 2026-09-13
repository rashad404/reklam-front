"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Gate, Status, Notice, Failure } from "@/components/ui/product";
import { useResource } from "@/hooks/useResource";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@/lib/navigation";
import PublisherOffer from "@/components/publisher/PublisherOffer";
import type { CommissionOffer } from "@/components/publisher/PublisherOffer";
import api from "@/lib/api/client";
interface Site {
  commission_offer?: CommissionOffer;
  website_name: string;
  website_url: string;
  status: string;
  verification_token: string;
  verified_at: string | null;
  review_reason: string | null;
}
function Content() {
  const t = useTranslations("product");
  const site = useResource<Site>("/publisher/site");
  const { refresh } = useAuth();
  const [error, setError] = useState(false),
    [busy, setBusy] = useState(false);
  async function register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await action("/publisher/register", {
      website_name: fd.get("name"),
      website_url: fd.get("url"),
    });
  }
  async function action(path: string, body = {}) {
    setBusy(true);
    setError(false);
    try {
      await api.post(path, body);
      await refresh();
      site.retry();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="wrap page narrow stack">
      <h1>{t("site")}</h1>
      {!site.loading && !site.error && (
        <PublisherOffer compact offer={site.data?.commission_offer} />
      )}
      {error && <Notice error>{t("saveError")}</Notice>}
      {site.error ? (
        <Failure retry={site.retry} />
      ) : site.loading ? (
        <p>{t("loading")}</p>
      ) : site.data ? (
        <>
          <section className="card stack">
            <div className="row between">
              <h2>{site.data.website_name}</h2>
              <Status value={site.data.status} />
            </div>
            <p className="break-all">{site.data.website_url}</p>
            {site.data.review_reason && (
              <Notice>{site.data.review_reason}</Notice>
            )}
            {site.data.status === "rejected" && (
              <button
                className="btn-secondary"
                disabled={busy}
                onClick={() => action("/publisher/resubmit")}
              >
                {t("resubmit")}
              </button>
            )}
          </section>
          <section className="card stack">
            <h2>{t("verification")}</h2>
            {site.data.verified_at ? (
              <Notice>{t("verified")}</Notice>
            ) : (
              <>
                <p>{t("verificationHelp")}</p>
                <pre>
                  TXT _reklam.{new URL(site.data.website_url).hostname}
                  {"\n"}reklam-verification={site.data.verification_token}
                </pre>
                <button
                  className="btn-primary"
                  disabled={busy}
                  onClick={() => action("/publisher/verify")}
                >
                  {busy ? t("loading") : t("verify")}
                </button>
              </>
            )}
          </section>
          <Link className="btn-secondary" href="/publisher/ad-units/create">
            {t("createPlacement")}
          </Link>
        </>
      ) : (
        <form className="card stack" onSubmit={register}>
          <p>{t("forPublishersDescription")}</p>
          <label className="field">
            {t("websiteName")}
            <input name="name" maxLength={120} required />
          </label>
          <label className="field">
            {t("websiteUrl")}
            <input
              name="url"
              type="url"
              pattern="https?://.*"
              placeholder="https://example.com"
              required
            />
          </label>
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
