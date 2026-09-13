"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Gate, Notice, Failure, Pager, Status } from "@/components/ui/product";
import { useResource } from "@/hooks/useResource";
import api from "@/lib/api/client";
import AdPreview, { type Creative } from "@/components/advertiser/AdPreview";
import { Link } from "@/lib/navigation";
interface Entry extends Creative {
  id: number;
  website_name?: string;
  website_url?: string;
  verified_at?: string;
  status: string;
  user?: { name: string; email: string };
  campaign?: {
    name: string;
    advertiser?: { user?: { name: string; email: string } };
  };
}
function Queue({ kind }: { kind: "ads" | "publishers" }) {
  const t = useTranslations("product");
  const [status, setStatus] = useState("pending"),
    [page, setPage] = useState(1),
    [busy, setBusy] = useState<number | null>(null),
    [reason, setReason] = useState<Record<number, string>>({}),
    [error, setError] = useState(false);
  const data = useResource<{ data: Entry[]; last_page: number }>(
    `/admin/${kind}?status=${status}&page=${page}`,
  );
  async function decide(id: number, next: string) {
    setBusy(id);
    setError(false);
    try {
      await api.patch(`/admin/${kind}/${id}/approve`, {
        status: next,
        reason: reason[id] || null,
      });
      data.retry();
    } catch {
      setError(true);
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="wrap page stack">
      <h1>
        {t("admin")}: {t(kind === "ads" ? "campaigns" : "site")}
      </h1>
      <div className="row">
        {[
          "pending",
          "approved",
          "rejected",
          ...(kind === "publishers" ? ["suspended"] : []),
        ].map((s) => (
          <button
            className={status === s ? "btn-primary" : "btn-secondary"}
            aria-pressed={status === s}
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
          >
            {t(s)}
          </button>
        ))}
      </div>
      {error && <Notice error>{t("saveError")}</Notice>}
      {data.error ? (
        <Failure retry={data.retry} />
      ) : data.loading ? (
        <p>{t("loading")}</p>
      ) : !data.data?.data.length ? (
        <div className="card empty">{t("empty")}</div>
      ) : (
        data.data.data.map((entry) => (
          <article className="card stack" key={entry.id}>
            <div className="row between">
              <h2>
                {entry.website_name || entry.campaign?.name || entry.title}
              </h2>
              <Status value={entry.status} />
            </div>
            {kind === "ads" ? (
              <div className="two-col">
                <AdPreview ad={entry} />
                <div className="stack">
                  <p className="break-all">{entry.destination_url}</p>
                  <p>{entry.campaign?.advertiser?.user?.email}</p>
                </div>
              </div>
            ) : (
              <>
                <p>{entry.website_url}</p>
                <p>{entry.user?.email}</p>
                <Notice>
                  {t(entry.verified_at ? "verified" : "verification")}
                </Notice>
              </>
            )}
            {entry.review_reason && <Notice>{entry.review_reason}</Notice>}
            <label className="field">
              {t("reason")}
              <textarea
                value={reason[entry.id] || ""}
                maxLength={1000}
                onChange={(e) =>
                  setReason((r) => ({ ...r, [entry.id]: e.target.value }))
                }
              />
            </label>
            <div className="row">
              <button
                className="btn-primary"
                disabled={
                  busy === entry.id ||
                  (kind === "publishers" && !entry.verified_at)
                }
                onClick={() => decide(entry.id, "approved")}
              >
                {t("approve")}
              </button>
              <button
                className="btn-secondary"
                disabled={
                  busy === entry.id ||
                  (reason[entry.id] || "").trim().length < 3
                }
                onClick={() => decide(entry.id, "rejected")}
              >
                {t("reject")}
              </button>
              {kind === "publishers" && (
                <button
                  className="btn-secondary"
                  disabled={
                    busy === entry.id ||
                    (reason[entry.id] || "").trim().length < 3
                  }
                  onClick={() => decide(entry.id, "suspended")}
                >
                  {t("suspend")}
                </button>
              )}
            </div>
          </article>
        ))
      )}
      {data.data && (
        <Pager page={page} total={data.data.last_page} onChange={setPage} />
      )}
    </div>
  );
}
function Overview() {
  const t = useTranslations("product");
  const data = useResource<Record<string, number>>("/admin/dashboard");
  return (
    <div className="wrap page stack">
      <h1>{t("admin")}</h1>
      {data.error ? (
        <Failure retry={data.retry} />
      ) : data.loading ? (
        <p>{t("loading")}</p>
      ) : (
        <div className="metrics">
          {[
            ["site", "total_publishers"],
            ["advertiser", "total_advertisers"],
            ["impressions", "total_impressions"],
            ["clicks", "total_clicks"],
          ].map(([label, key]) => (
            <div className="metric" key={key}>
              <span>{t(label)}</span>
              <strong>{data.data?.[key] ?? 0}</strong>
            </div>
          ))}
        </div>
      )}
      <div className="two-col">
        <Link className="card stack" href="/admin/ads">
          <h2>{t("campaigns")}</h2>
          <p>
            {t("pending")}: {data.data?.pending_ads ?? "-"}
          </p>
        </Link>
        <Link className="card stack" href="/admin/publishers">
          <h2>{t("site")}</h2>
          <p>
            {t("pending")}: {data.data?.pending_publishers ?? "-"}
          </p>
        </Link>
      </div>
    </div>
  );
}
export default function Admin({ kind }: { kind?: "ads" | "publishers" }) {
  return <Gate admin>{kind ? <Queue kind={kind} /> : <Overview />}</Gate>;
}
