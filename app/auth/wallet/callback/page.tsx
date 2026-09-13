"use client";
import { useEffect, useState } from "react";
import { safeReturnPath } from "@/lib/utils/walletAuth";
const messages = {
  az: ["Daxil olunur...", "Giriş alınmadı. Yenidən cəhd edin.", "Ana səhifə"],
  en: ["Signing in...", "Sign-in failed. Please try again.", "Homepage"],
  ru: [
    "Выполняется вход...",
    "Не удалось войти. Попробуйте еще раз.",
    "Главная",
  ],
};
let exchange: Promise<void> | null = null;
async function complete() {
  const p = new URLSearchParams(window.location.search),
    state = p.get("state"),
    saved = localStorage.getItem("wallet_oauth_state"),
    verifier = localStorage.getItem("wallet_code_verifier");
  if (
    p.get("error") ||
    !p.get("code") ||
    !state ||
    !saved ||
    state !== saved ||
    !verifier ||
    Date.now() - Number(localStorage.getItem("wallet_oauth_time")) > 600000
  )
    throw Error("invalid_session");
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "https://api.reklam.biz/api"}/auth/wallet/callback`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        code: p.get("code"),
        code_verifier: verifier,
        redirect_uri: `${window.location.origin}/auth/wallet/callback`,
      }),
    },
  );
  const data = await response.json();
  if (!response.ok || !data.data?.token) throw Error("login_failed");
  localStorage.setItem("token", data.data.token);
  const destination = safeReturnPath(
    localStorage.getItem("wallet_return_path"),
  );
  [
    "wallet_code_verifier",
    "wallet_oauth_state",
    "wallet_oauth_time",
    "wallet_return_path",
  ].forEach((key) => localStorage.removeItem(key));
  window.history.replaceState({}, "", window.location.pathname);
  if (window.opener) {
    window.opener.postMessage(
      { type: "oauth_success", state },
      window.location.origin,
    );
    window.close();
  } else window.location.replace(destination);
}
export default function Callback() {
  const [failed, setFailed] = useState(false);
  const [locale, setLocale] = useState<keyof typeof messages>("az");
  useEffect(() => {
    const value = localStorage.getItem("wallet_locale");
    queueMicrotask(() =>
      setLocale(value === "en" || value === "ru" ? value : "az"),
    );
    exchange ||= complete();
    exchange.catch(() => {
      setFailed(true);
      if (window.opener)
        window.opener.postMessage(
          {
            type: "oauth_error",
            state: new URLSearchParams(window.location.search).get("state"),
          },
          window.location.origin,
        );
    });
  }, []);
  return (
    <main className="wrap page narrow stack">
      <h1>{messages[locale][failed ? 1 : 0]}</h1>
      {failed && (
        <a className="btn-primary" href={locale === "az" ? "/" : `/${locale}`}>
          {messages[locale][2]}
        </a>
      )}
    </main>
  );
}
