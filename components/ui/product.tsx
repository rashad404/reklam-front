"use client";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import AuthRequiredCard from "@/components/auth/AuthRequiredCard";
export function Notice({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`notice ${error ? "error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
export function Status({ value }: { value: string }) {
  const t = useTranslations("product");
  return (
    <span className={`badge badge-${value}`}>
      {t.has(value) ? t(value) : value}
    </span>
  );
}
export function Gate({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const t = useTranslations("product");
  const auth = useAuth();
  if (auth.isLoading)
    return (
      <div className="wrap page" role="status">
        {t("loading")}
      </div>
    );
  if (auth.error)
    return (
      <div className="wrap page">
        <Notice error>
          {t("loadError")}{" "}
          <button className="btn-secondary" onClick={auth.refresh}>
            {t("retry")}
          </button>
        </Notice>
      </div>
    );
  if (!auth.isAuthenticated) return <AuthRequiredCard />;
  if (admin && !auth.user?.is_admin)
    return (
      <div className="wrap page">
        <Notice error>{t("forbidden")}</Notice>
      </div>
    );
  return children;
}
export function Pager({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (n: number) => void;
}) {
  const t = useTranslations("product");
  return (
    <nav className="row between" aria-label={t("page", { page, total })}>
      <button
        className="btn-secondary"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        {t("previous")}
      </button>
      <span className="muted">{t("page", { page, total })}</span>
      <button
        className="btn-secondary"
        disabled={page >= total}
        onClick={() => onChange(page + 1)}
      >
        {t("next")}
      </button>
    </nav>
  );
}
export function Failure({ retry }: { retry: () => void }) {
  const t = useTranslations("product");
  return (
    <Notice error>
      {t("loadError")}{" "}
      <button className="btn-secondary" onClick={retry}>
        {t("retry")}
      </button>
    </Notice>
  );
}
