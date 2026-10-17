"use client";
import { use, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, BarChart3, ExternalLink } from "lucide-react";
import axios from "axios";
import {
  Gate,
  Failure,
  Notice,
  PageHead,
  Status,
} from "@/components/ui/product";
import { useResource } from "@/hooks/useResource";
import { Link } from "@/lib/navigation";
import PlacementList from "@/components/publisher/PlacementList";
import { isLive, type Site } from "@/components/publisher/site";
import api from "@/lib/api/client";
function Content({ id }: { id: number }) {
  const t = useTranslations("product");
  const site = useResource<Site>(`/sites/${id}`);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null);
  async function action(kind: "verify" | "resubmit") {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/sites/${id}/${kind}`);
      site.retry();
    } catch (err) {
      setError(
        kind === "verify" &&
          axios.isAxiosError(err) &&
          err.response?.status === 422
          ? t("verifyNotFound")
          : t("saveError"),
      );
    } finally {
      setBusy(false);
    }
  }
  const s = site.data;
  const state = !s
    ? null
    : isLive(s)
      ? "siteLive"
      : s.status === "rejected"
        ? "siteRejected"
        : s.status === "suspended"
          ? "siteSuspended"
          : !s.verified_at
            ? "siteNeedsVerificationLong"
            : "sitePendingReview";
  return (
    <div className="wrap page stack">
      <Link className="back-link" href="/publisher/sites">
        <ArrowLeft size={16} />
        {t("sites")}
      </Link>
      {site.error ? (
        <Failure retry={site.retry} />
      ) : !s ? (
        <p role="status">{t("loading")}</p>
      ) : (
        <>
          <PageHead
            eyebrow={
              <a
                className="site-link"
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.host}
                <ExternalLink size={13} />
              </a>
            }
            title={s.name}
          >
            <Link
              className="btn-secondary"
              href={`/publisher/stats?site=${s.id}`}
            >
              <BarChart3 size={17} />
              {t("reports")}
            </Link>
          </PageHead>
          <section
            className={`site-state ${isLive(s) ? "live" : ""}`}
            aria-label={t("status")}
          >
            <div className="site-facts">
              <div>
                <span>{t("reviewState")}</span>
                <Status value={s.status} />
              </div>
              <div>
                <span>{t("ownership")}</span>
                <Status
                  value={s.verified_at ? "approved" : "pending"}
                  label={t(
                    s.verified_at ? "verifiedShort" : "notVerifiedShort",
                  )}
                />
              </div>
            </div>
            <p>{state && t(state)}</p>
            {s.review_reason && s.status !== "approved" && (
              <Notice>
                <strong>{t("reason")}:</strong> {s.review_reason}
              </Notice>
            )}
            {s.status === "rejected" && (
              <div>
                <button
                  className="btn-secondary"
                  disabled={busy}
                  onClick={() => action("resubmit")}
                >
                  {t("resubmit")}
                </button>
              </div>
            )}
          </section>
          {error && <Notice error>{error}</Notice>}
          {!s.verified_at && (
            <section className="card verify-card">
              <h2>{t("verification")}</h2>
              <ol className="install-steps">
                <li>{t("verifyStep1")}</li>
                <li>{t("verifyStep2")}</li>
                <li>{t("verifyStep3")}</li>
              </ol>
              <dl className="dns-record">
                <div>
                  <dt>{t("dnsType")}</dt>
                  <dd>TXT</dd>
                </div>
                <div>
                  <dt>{t("dnsName")}</dt>
                  <dd>
                    <code>_reklam.{s.host}</code>
                  </dd>
                </div>
                <div>
                  <dt>{t("dnsValue")}</dt>
                  <dd>
                    <code>reklam-verification={s.verification_token}</code>
                  </dd>
                </div>
              </dl>
              <div>
                <button
                  className="btn-primary"
                  disabled={busy}
                  onClick={() => action("verify")}
                >
                  {busy ? t("loading") : t("verify")}
                </button>
              </div>
            </section>
          )}
          <PlacementList siteId={s.id} />
        </>
      )}
    </div>
  );
}
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Gate>
      <Content id={Number(id)} />
    </Gate>
  );
}
