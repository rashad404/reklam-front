"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Gate, Notice, Failure, Pager, Status } from "@/components/ui/product";
import { useResource } from "@/hooks/useResource";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@/lib/navigation";
import api from "@/lib/api/client";
interface Unit {
  id: number;
  name: string;
  ad_format: string;
  status: string;
  website_url: string;
  last_seen_at: string | null;
}
function Content() {
  const t = useTranslations("product"),
    { user } = useAuth();
  const [page, setPage] = useState(1),
    [error, setError] = useState(false),
    [busy, setBusy] = useState<number | null>(null),
    [code, setCode] = useState<{ id: number; text: string } | null>(null),
    [copied, setCopied] = useState(false),
    [copyError, setCopyError] = useState(false),
    [editing, setEditing] = useState<number | null>(null);
  const data = useResource<{ data: Unit[]; last_page: number }>(
    user?.publisher ? `/ad-units?page=${page}` : null,
  );
  async function action(u: Unit, kind: string, name?: string) {
    if (kind === "archive" && !confirm(t("archiveConfirm"))) return;
    setBusy(u.id);
    setError(false);
    try {
      if (kind === "code") {
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
      <div className="row between">
        <h1>{t("placements")}</h1>
        <Link className="btn-primary" href="/publisher/ad-units/create">
          {t("createPlacement")}
        </Link>
      </div>
      {error && <Notice error>{t("saveError")}</Notice>}
      {!user?.publisher ? (
        <div className="card empty">
          <p>{t("noPlacements")}</p>
          <Link href="/publisher/site" className="btn-primary">
            {t("site")}
          </Link>
        </div>
      ) : data.error ? (
        <Failure retry={data.retry} />
      ) : data.loading ? (
        <p>{t("loading")}</p>
      ) : !data.data?.data.length ? (
        <div className="card empty">
          <p>{t("noPlacements")}</p>
        </div>
      ) : (
        data.data.data.map((u) => (
          <article className="record" key={u.id}>
            <div className="row between">
              <h2>{u.name}</h2>
              <Status value={u.status} />
            </div>
            <p>
              {u.ad_format.replace("banner_", "")} - {u.website_url}
            </p>
            <p className="text-sm">
              {t(u.last_seen_at ? "installed" : "notInstalled")}
            </p>
            <div className="row">
              <button
                className="btn-primary"
                disabled={busy === u.id}
                onClick={() => action(u, "code")}
              >
                {t("embed")}
              </button>
              <button
                className="btn-secondary"
                disabled={busy === u.id}
                onClick={() =>
                  action(u, u.status === "active" ? "paused" : "active")
                }
              >
                {t(u.status === "active" ? "pause" : "activate")}
              </button>
              <button
                className="btn-secondary"
                onClick={() => setEditing(editing === u.id ? null : u.id)}
              >
                {t("edit")}
              </button>
              <Link
                className="btn-secondary"
                href={`/publisher/stats?unit=${u.id}`}
              >
                {t("reports")}
              </Link>
              <button
                className="btn-quiet"
                disabled={busy === u.id}
                onClick={() => action(u, "archive")}
              >
                {t("archive")}
              </button>
            </div>
            {editing === u.id && (
              <form
                className="row"
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
                  />
                </label>
                <button className="btn-primary" disabled={busy === u.id}>
                  {t("save")}
                </button>
              </form>
            )}
            {code?.id === u.id && (
              <section className="stack">
                <h3>{t("embed")}</h3>
                <p>{t("embedHelp")}</p>
                <pre>{code.text}</pre>
                {copyError && <Notice error>{t("copyFailed")}</Notice>}
                <div>
                  <button className="btn-secondary" onClick={copy}>
                    {t(copied ? "copied" : "copy")}
                  </button>
                </div>
              </section>
            )}
          </article>
        ))
      )}
      {data.data && (
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
