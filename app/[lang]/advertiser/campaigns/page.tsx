"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus, Search, Pencil } from "lucide-react";
import { Link, useRouter } from "@/lib/navigation";
import {
  Gate,
  Pager,
  Failure,
  Notice,
  Status,
  PageHead,
  FormatGlyph,
  RowMenu,
} from "@/components/ui/product";
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
  const t = useTranslations("product"),
    locale = useLocale(),
    router = useRouter();
  const [page, setPage] = useState(1),
    [status, setStatus] = useState(""),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [error, setError] = useState(false),
    [busy, setBusy] = useState<number | null>(null);
  const data = useResource<{ data: Campaign[]; last_page: number }>(
    `/campaigns?page=${page}&status=${status}&search=${encodeURIComponent(query)}`,
  );
  const numbers = new Intl.NumberFormat(locale);
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
  const filtered = !!query || !!status;
  return (
    <div className="wrap page stack">
      <PageHead
        eyebrow={t("roleAdvertiser")}
        title={t("campaigns")}
        description={t("campaignsIntro")}
      >
        <Link className="btn-primary" href="/advertiser/campaigns/create">
          <Plus size={17} />
          {t("createCampaign")}
        </Link>
      </PageHead>
      {error && <Notice error>{t("saveError")}</Notice>}
      <section className="list" aria-label={t("campaigns")}>
        <form
          className="list-toolbar list-filters"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQuery(search);
          }}
        >
          <label className="search-field">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">{t("search")}</span>
            <input
              type="search"
              value={search}
              placeholder={t("search")}
              onChange={(e) => setSearch(e.target.value)}
              maxLength={100}
            />
          </label>
          <label className="select-field">
            <span className="sr-only">{t("status")}</span>
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
        </form>
        {data.error ? (
          <div className="list-panel">
            <Failure retry={data.retry} />
          </div>
        ) : data.loading ? (
          <p className="list-panel" role="status">
            {t("loading")}
          </p>
        ) : !data.data?.data.length ? (
          <div className="list-empty">
            <p>{t(filtered ? "noMatches" : "noCampaigns")}</p>
            {!filtered && (
              <Link
                className="btn-secondary btn-sm"
                href="/advertiser/campaigns/create"
              >
                <Plus size={16} />
                {t("createCampaign")}
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="list-head campaigns-grid" aria-hidden="true">
              <span>{t("campaignColumn")}</span>
              <span>{t("status")}</span>
              <span className="num">{t("trafficTotal")}</span>
              <span />
            </div>
            {data.data.data.map((c) => {
              const approved = c.ads.some((a) => a.status === "approved");
              return (
                <article className="list-row" key={c.id}>
                  <div className="campaigns-grid">
                    <div className="list-main">
                      <h2 className="list-title">
                        <Link href={`/advertiser/stats/${c.id}`}>{c.name}</Link>
                      </h2>
                      <span className="recent-formats">
                        {[...new Set(c.ads.map((a) => a.ad_format))].map(
                          (format) => {
                            const ads = c.ads.filter(
                              (a) => a.ad_format === format,
                            );
                            const open = ads.find(
                              (a) => a.status && a.status !== "approved",
                            );
                            return (
                              <span className="creative" key={format}>
                                <FormatGlyph format={format} />
                                {ads.length > 1 && (
                                  <span className="muted text-sm">
                                    ×{ads.length}
                                  </span>
                                )}
                                {open?.status && <Status value={open.status} />}
                              </span>
                            );
                          },
                        )}
                      </span>
                      {c.ads.some((a) => a.review_reason) && (
                        <span className="list-reason">
                          {c.ads.find((a) => a.review_reason)?.review_reason}
                        </span>
                      )}
                    </div>
                    <div className="list-cell list-status">
                      <Status value={c.status} />
                      {c.status !== "active" && !approved && (
                        <span className="signal">
                          {t(
                            c.ads.length
                              ? "activateNeedsApproval"
                              : "activateNeedsAd",
                          )}
                        </span>
                      )}
                    </div>
                    <div className="list-cell num list-traffic">
                      <span>
                        <strong>{numbers.format(c.impressions_count)}</strong>{" "}
                        {t("impressions")}
                      </span>
                      <span>
                        <strong>{numbers.format(c.clicks_count)}</strong>{" "}
                        {t("clicks")}
                      </span>
                    </div>
                    <div className="list-actions">
                      <Link
                        className="btn-secondary btn-sm"
                        href={`/advertiser/campaigns/${c.id}/edit`}
                      >
                        <Pencil size={15} />
                        {t("edit")}
                      </Link>
                      <RowMenu
                        items={[
                          c.status === "active"
                            ? {
                                label: t("pause"),
                                disabled: busy === c.id,
                                onSelect: () => change(c, "paused"),
                              }
                            : {
                                label: t("activate"),
                                disabled: busy === c.id || !approved,
                                onSelect: () => change(c, "active"),
                              },
                          {
                            label: t("reports"),
                            onSelect: () =>
                              router.push(`/advertiser/stats/${c.id}`),
                          },
                          {
                            label: t("archive"),
                            danger: true,
                            disabled: busy === c.id,
                            onSelect: () => change(c, "archive"),
                          },
                        ]}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </>
        )}
      </section>
      {data.data && data.data.last_page > 1 && (
        <Pager page={page} total={data.data.last_page} onChange={setPage} />
      )}
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
