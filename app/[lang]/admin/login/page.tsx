"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Notice } from "@/components/ui/product";
import api from "@/lib/api/client";
export default function AdminLogin() {
  const t = useTranslations("product"),
    auth = useTranslations("auth"),
    router = useRouter(),
    { refresh } = useAuth();
  const [error, setError] = useState(false),
    [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const f = new FormData(e.currentTarget);
    try {
      const r = await api.post("/auth/login", {
        email: f.get("email"),
        password: f.get("password"),
      });
      if (!r.data.data.user.is_admin) throw Error("forbidden");
      localStorage.setItem("token", r.data.data.token);
      await refresh();
      router.replace("/admin");
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="wrap page narrow stack">
      <h1>{t("admin")}</h1>
      <form className="card stack" onSubmit={submit}>
        {error && <Notice error>{t("loadError")}</Notice>}
        <label className="field">
          {auth("email")}
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label className="field">
          {auth("password")}
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        <button className="btn-primary" disabled={busy}>
          {t("signIn")}
        </button>
      </form>
    </div>
  );
}
