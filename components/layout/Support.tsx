"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Gate, Notice, Failure, Pager, Status } from "@/components/ui/product";
import { useResource } from "@/hooks/useResource";
import api from "@/lib/api/client";
interface Ticket {
  id: number;
  subject: string;
  message: string;
  status: string;
  reply: string | null;
  email?: string;
}
function Inbox({ admin }: { admin: boolean }) {
  const t = useTranslations("product");
  const [page, setPage] = useState(1),
    [status, setStatus] = useState("open"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(false),
    [sent, setSent] = useState(false),
    [requestKey, setRequestKey] = useState("");
  const resource = useResource<{ data: Ticket[]; last_page: number }>(
    admin
      ? `/admin/support?status=${status}&page=${page}`
      : `/support?page=${page}`,
  );
  async function send(event: React.FormEvent<HTMLFormElement>, id?: number) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError(false);
    setSent(false);
    try {
      if (admin)
        await api.patch(`/admin/support/${id}`, {
          reply: data.get("reply"),
          status: data.get("status"),
        });
      else {
        const key = requestKey || crypto.randomUUID();
        setRequestKey(key);
        await api.post("/support", {
          subject: data.get("subject"),
          message: data.get("message"),
          request_key: key,
        });
        setRequestKey("");
      }
      form.reset();
      setSent(true);
      setPage(1);
      resource.retry();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="wrap page narrow stack">
      <h1>{t("support")}</h1>
      <p>{t(admin ? "supportAdminHelp" : "supportHelp")}</p>
      {error && <Notice error>{t("loadError")}</Notice>}
      {sent && <Notice>{t("supportSaved")}</Notice>}
      {admin ? (
        <div className="row">
          {["open", "answered", "closed"].map((value) => (
            <button
              key={value}
              className={value === status ? "btn-primary" : "btn-secondary"}
              aria-pressed={value === status}
              onClick={() => {
                setStatus(value);
                setPage(1);
              }}
            >
              {t(value)}
            </button>
          ))}
        </div>
      ) : (
        <form className="card stack" onSubmit={(e) => send(e)}>
          <label className="field">
            {t("supportSubject")}
            <input name="subject" required minLength={3} maxLength={120} />
          </label>
          <label className="field">
            {t("supportMessage")}
            <textarea
              name="message"
              rows={5}
              required
              minLength={10}
              maxLength={3000}
            />
          </label>
          <button className="btn-primary" disabled={busy}>
            {t(busy ? "loading" : "supportSend")}
          </button>
        </form>
      )}
      {!admin && <h2>{t("supportHistory")}</h2>}
      {resource.loading ? (
        <p role="status">{t("loading")}</p>
      ) : resource.error ? (
        <Failure retry={resource.retry} />
      ) : (
        <>
          {resource.data?.data.length === 0 && <Notice>{t("empty")}</Notice>}
          {resource.data?.data.map((ticket) => (
            <article key={ticket.id} className="card stack">
              <div className="row between">
                <h2>
                  #{ticket.id} {ticket.subject}
                </h2>
                <Status value={ticket.status} />
              </div>
              {admin && <p className="muted">{ticket.email}</p>}
              <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {ticket.message}
              </p>
              {ticket.reply && (
                <div className="notice">
                  <strong>{t("supportReply")}</strong>
                  <p
                    style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                  >
                    {ticket.reply}
                  </p>
                </div>
              )}
              {admin && (
                <form className="stack" onSubmit={(e) => send(e, ticket.id)}>
                  <label className="field">
                    {t("supportReply")}
                    <textarea
                      name="reply"
                      rows={4}
                      required
                      minLength={3}
                      maxLength={5000}
                      defaultValue={ticket.reply || ""}
                    />
                  </label>
                  <label className="field">
                    {t("status")}
                    <select name="status" defaultValue="answered">
                      <option value="answered">{t("answered")}</option>
                      <option value="closed">{t("closed")}</option>
                    </select>
                  </label>
                  <button className="btn-primary" disabled={busy}>
                    {t(busy ? "loading" : "supportSaveReply")}
                  </button>
                </form>
              )}
            </article>
          ))}
          <Pager
            page={page}
            total={resource.data?.last_page || 1}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
export default function Support({ admin = false }: { admin?: boolean }) {
  return (
    <Gate admin={admin}>
      <Inbox admin={admin} />
    </Gate>
  );
}
