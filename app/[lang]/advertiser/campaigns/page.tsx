"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { Gate, Pager, Failure, Notice, Status } from "@/components/ui/product";
import { useResource } from "@/hooks/useResource";
import api from "@/lib/api/client";
import type { Creative } from "@/components/advertiser/AdPreview";
interface Campaign {
  id: number;
  name: string;
  status: string;
  ads: Creative[];
  impressions_count: number;
  clicks_count: number;
}
function Campaigns() {
  const t = useTranslations("product");
  const [page, setPage] = useState(1),
    [status, setStatus] = useState(""),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [error, setError] = useState(false),
    [busy, setBusy] = useState<number | null>(null);
  const data = useResource<{ data: Campaign[]; last_page: number }>(
    `/campaigns?page=${page}&status=${status}&search=${encodeURIComponent(query)}`,
  );
  async function change(c: Campaign, action: string) {
    if (action === "archive" && !confirm(t("archiveConfirm"))) return;
    setBusy(c.id);
    setError(false);
    try {
      if (action === "archive") await api.delete(`/campaigns/${c.id}`);
      else await api.patch(`/campaigns/${c.id}/status`, { status: action });
      data.retry();
    } catch {
      setError(true);
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="wrap page stack">
      <div className="row between">
        <h1>{t("campaigns")}</h1>
        <Link className="btn-primary" href="/advertiser/campaigns/create">
          {t("createCampaign")}
        </Link>
      </div>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(search);
        }}
      >
        <label className="field grow">
          {t("search")}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={100}
          />
        </label>
        <label className="field">
          {t("all")}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t("all")}</option>
            {["draft", "active", "paused", "completed"].map((s) => (
              <option key={s} value={s}>
                {t(s)}
              </option>
            ))}
          </select>
        </label>
        <button className="btn-secondary self-end">{t("search")}</button>
      </form>
      {error && <Notice error>{t("saveError")}</Notice>}
      {data.error ? (
        <Failure retry={data.retry} />
      ) : data.loading ? (
        <p>{t("loading")}</p>
      ) : !data.data?.data.length ? (
        <div className="card empty">
          <h2>{t("empty")}</h2>
          <p>{t("noCampaigns")}</p>
        </div>
      ) : (
        data.data.data.map((c) => (
          <article className="record" key={c.id}>
            <div className="row between">
              <h2>{c.name}</h2>
              <Status value={c.status} />
            </div>
            <div className="row muted text-sm">
              <span>
                {t("impressions")}: {c.impressions_count}
              </span>
              <span>
                {t("clicks")}: {c.clicks_count}
              </span>
            </div>
            <div className="row">
              {c.ads.map((a) => (
                <span className="row text-sm" key={a.id}>
                  {a.ad_format.replace("banner_", "")}{" "}
                  <Status value={a.status || "pending"} />
                  {a.review_reason && <span>{a.review_reason}</span>}
                </span>
              ))}
            </div>
            <div className="row">
              <Link
                className="btn-secondary"
                href={`/advertiser/campaigns/${c.id}/edit`}
              >
                {t("edit")}
              </Link>
              <Link
                className="btn-secondary"
                href={`/advertiser/stats/${c.id}`}
              >
                {t("reports")}
              </Link>
              {c.status === "active" ? (
                <button
                  className="btn-secondary"
                  disabled={busy === c.id}
                  onClick={() => change(c, "paused")}
                >
                  {t("pause")}
                </button>
              ) : (
                <button
                  className="btn-secondary"
                  disabled={
                    busy === c.id || !c.ads.some((a) => a.status === "approved")
                  }
                  onClick={() => change(c, "active")}
                >
                  {t("activate")}
                </button>
              )}
              <button
                className="btn-quiet"
                disabled={busy === c.id}
                onClick={() => change(c, "archive")}
              >
                {t("archive")}
              </button>
            </div>
          </article>
        ))
      )}
      {data.data && (
        <Pager page={page} total={data.data.last_page} onChange={setPage} />
      )}
      <Notice>
        {t("reviewHint")} {t("deliveryHint")}
      </Notice>
    </div>
  );
}
export default function Page() {
  return (
    <Gate>
      <Campaigns />
    </Gate>
  );
}
