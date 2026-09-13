"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { Gate, Notice } from "@/components/ui/product";
import api from "@/lib/api/client";
function Content() {
  const t = useTranslations("product");
  const { user, refresh } = useAuth();
  const [error, setError] = useState(false),
    [busy, setBusy] = useState(false);
  async function sync() {
    setBusy(true);
    setError(false);
    try {
      await api.post("/auth/sync-from-wallet");
      await refresh();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("token");
      await refresh();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="wrap page narrow stack">
      <h1>{t("settings")}</h1>
      {error && <Notice error>{t("loadError")}</Notice>}
      <section className="card stack">
        <h2>{user?.name}</h2>
        <p>{user?.email}</p>
        {user?.phone && <p>{user.phone}</p>}
        <p>{t("settingsDescription")}</p>
        {user?.wallet_id && (
          <>
            <a
              className="btn-secondary"
              href={`${process.env.NEXT_PUBLIC_WALLET_URL || "https://kimlik.az"}/settings`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Kimlik.az
            </a>
            <button className="btn-secondary" onClick={sync} disabled={busy}>
              {t("retry")}
            </button>
          </>
        )}
        <button className="btn-primary" onClick={logout} disabled={busy}>
          {t("signOut")}
        </button>
      </section>
    </div>
  );
}
export default function Settings() {
  return (
    <Gate>
      <Content />
    </Gate>
  );
}
