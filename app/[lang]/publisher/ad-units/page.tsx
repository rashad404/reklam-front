"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Code2, Copy, Check, Plus } from "lucide-react";
import {
  Gate,
  Notice,
  Failure,
  Pager,
  Status,
  PageHead,
  FormatGlyph,
  RowMenu,
} from "@/components/ui/product";
import { useResource } from "@/hooks/useResource";
import { useAuth } from "@/hooks/useAuth";
import { Link, useRouter } from "@/lib/navigation";
import { formatDate } from "@/lib/utils/date";
import api from "@/lib/api/client";
interface Unit {
  id: number;
  name: string;
  ad_format: string;
  status: string;
  website_url: string;
  last_seen_at: string | null;
  impressions_count?: number;
  clicks_count?: number;
}
function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
function Content() {
  const t = useTranslations("product"),
    locale = useLocale(),
    router = useRouter(),
    { user } = useAuth();
  const [page, setPage] = useState(1),
    [error, setError] = useState(false),
    [busy, setBusy] = useState<number | null>(null),
    [code, setCode] = useState<{ id: number; text: string } | null>(null),
    [copied, setCopied] = useState(false),
    [copyError, setCopyError] = useState(false),
    [editing, setEditing] = useState<number | null>(null);
  const data = useResource<{
    data: Unit[];
    last_page: number;
    total: number;
  }>(user?.publisher ? `/ad-units?page=${page}` : null);
  const numbers = new Intl.NumberFormat(locale);
  async function action(u: Unit, kind: string, name?: string) {
    if (kind === "archive" && !confirm(t("archiveConfirm"))) return;
    setBusy(u.id);
    setError(false);
    try {
      if (kind === "code") {
        if (code?.id === u.id) {
          setCode(null);
          return;
        }
        const r = await api.get(`/ad-units/${u.id}/code`);
        setCode({ id: u.id, text: r.data.data.embed_code });
        setCopied(false);
        setCopyError(false);
      } else if (kind === "archive") {
        await api.delete(`/ad-units/${u.id}`);
        data.retry();
      } else {
        await api.put(`/ad-units/${u.id}`, name ? { name } : { status: kind });
        setEditing(null);
        data.retry();
      }
    } catch {
      setError(true);
    } finally {
      setBusy(null);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(code!.text);
      setCopied(true);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <div className="wrap page stack">
      <PageHead
        eyebrow={t("rolePublisher")}
        title={t("placements")}
        description={t("placementsIntro")}
      >
        <Link className="btn-primary" href="/publisher/ad-units/create">
          <Plus size={17} />
          {t("createPlacement")}
        </Link>
      </PageHead>
      {error && <Notice error>{t("saveError")}</Notice>}
      {!user?.publisher ? (
        <div className="empty-state">
          <div className="empty-formats" aria-hidden="true">
            <span className="f300" />
            <span className="f728" />
            <span className="f320" />
          </div>
          <h2>{t("noSiteTitle")}</h2>
          <p>{t("noPlacements")}</p>
          <Link href="/publisher/site" className="btn-primary">
            {t("registerSite")}
          </Link>
        </div>
      ) : data.error ? (
        <Failure retry={data.retry} />
      ) : data.loading ? (
        <p role="status">{t("loading")}</p>
      ) : !data.data?.data.length ? (
        <div className="empty-state">
          <div className="empty-formats" aria-hidden="true">
            <span className="f300" />
            <span className="f728" />
            <span className="f320" />
          </div>
          <h2>{t("noPlacementsTitle")}</h2>
          <p>{t("noPlacements")}</p>
          <Link href="/publisher/ad-units/create" className="btn-primary">
            <Plus size={17} />
            {t("createPlacement")}
          </Link>
        </div>
      ) : (
        <section className="list" aria-label={t("placements")}>
          <div className="list-head units-grid" aria-hidden="true">
            <span>{t("placementColumn")}</span>
            <span>{t("format")}</span>
            <span>{t("status")}</span>
            <span className="num">{t("trafficTotal")}</span>
            <span />
          </div>
          {data.data.data.map((u) => (
            <article className="list-row" key={u.id}>
              <div className="units-grid">
                <div className="list-main">
                  <h2 className="list-title">{u.name}</h2>
                  <span className="list-sub">{host(u.website_url)}</span>
                </div>
                <div className="list-cell">
                  <FormatGlyph format={u.ad_format} />
                </div>
                <div className="list-cell list-status">
                  <Status value={u.status} />
                  <span className={`signal ${u.last_seen_at ? "on" : ""}`}>
                    {u.last_seen_at
                      ? t("lastSignal", {
                          date: formatDate(u.last_seen_at, locale, "short"),
                        })
                      : t("notInstalled")}
                  </span>
                </div>
                <div className="list-cell num list-traffic">
                  <span>
                    <strong>{numbers.format(u.impressions_count ?? 0)}</strong>{" "}
                    {t("impressions")}
                  </span>
                  <span>
                    <strong>{numbers.format(u.clicks_count ?? 0)}</strong>{" "}
                    {t("clicks")}
                  </span>
                </div>
                <div className="list-actions">
                  <button
                    className="btn-secondary btn-sm"
                    aria-expanded={code?.id === u.id}
                    disabled={busy === u.id}
                    onClick={() => action(u, "code")}
                  >
                    <Code2 size={16} />
                    {t("embed")}
                  </button>
                  <RowMenu
                    items={[
                      {
                        label: t(u.status === "active" ? "pause" : "activate"),
                        disabled: busy === u.id,
                        onSelect: () =>
                          action(
                            u,
                            u.status === "active" ? "paused" : "active",
                          ),
                      },
                      {
                        label: t("rename"),
                        onSelect: () => setEditing(u.id),
                      },
                      {
                        label: t("reports"),
                        onSelect: () =>
                          router.push(`/publisher/stats?unit=${u.id}`),
                      },
                      {
                        label: t("archive"),
                        danger: true,
                        disabled: busy === u.id,
                        onSelect: () => action(u, "archive"),
                      },
                    ]}
                  />
                </div>
              </div>
              {editing === u.id && (
                <form
                  className="list-panel row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    void action(u, "edit", String(fd.get("name")));
                  }}
                >
                  <label className="field grow">
                    {t("name")}
                    <input
                      name="name"
                      required
                      maxLength={120}
                      defaultValue={u.name}
                      autoFocus
                    />
                  </label>
                  <div className="row self-end">
                    <button
                      type="button"
                      className="btn-quiet"
                      onClick={() => setEditing(null)}
                    >
                      {t("cancel")}
                    </button>
                    <button className="btn-primary" disabled={busy === u.id}>
                      {t("save")}
                    </button>
                  </div>
                </form>
              )}
              {code?.id === u.id && (
                <section className="list-panel install-panel">
                  <ol className="install-steps">
                    <li>{t("installStep1")}</li>
                    <li>{t("installStep2")}</li>
                    <li>{t("installStep3")}</li>
                  </ol>
                  <div className="code-block">
                    <pre>{code.text}</pre>
                    <button className="btn-secondary btn-sm" onClick={copy}>
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {t(copied ? "copied" : "copy")}
                    </button>
                  </div>
                  {copyError && <Notice error>{t("copyFailed")}</Notice>}
                  <p className="text-sm">{t("embedHelp")}</p>
                </section>
              )}
            </article>
          ))}
        </section>
      )}
      {data.data && data.data.last_page > 1 && (
        <Pager page={page} total={data.data.last_page} onChange={setPage} />
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
