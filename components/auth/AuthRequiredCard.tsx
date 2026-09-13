"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { openWalletLogin } from "@/lib/utils/walletAuth";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api/client";
export default function AuthRequiredCard() {
  const t = useTranslations("product"),
    locale = useLocale();
  const [error, setError] = useState(false),
    [busy, setBusy] = useState(false);
  const { refresh } = useAuth();
  async function login() {
    setBusy(true);
    setError(false);
    await openWalletLogin({
      locale,
      onError: () => {
        setError(true);
        setBusy(false);
      },
    });
  }
  async function localLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const r = await api.post("/auth/login", {
        email: fd.get("email"),
        password: fd.get("password"),
      });
      localStorage.setItem("token", r.data.data.token);
      await refresh();
    } catch {
      setError(true);
    }
  }
  return (
    <div className="wrap page narrow">
      <section className="card stack">
        <h1>{t("signIn")}</h1>
        <p>{t("loginHelp")}</p>
        {error && <p role="alert">{t("loadError")}</p>}
        <button className="btn-primary" disabled={busy} onClick={login}>
          {busy ? t("loading") : t("signIn") + " - Kimlik.az"}
        </button>
        {process.env.NEXT_PUBLIC_LOCAL_TEST_LOGIN === "true" && (
          <form className="stack" onSubmit={localLogin}>
            <h2>{t("localLogin")}</h2>
            <label className="field">
              Email
              <input name="email" type="email" required />
            </label>
            <label className="field">
              Password
              <input name="password" type="password" required />
            </label>
            <button className="btn-secondary">{t("signIn")}</button>
          </form>
        )}
      </section>
    </div>
  );
}
