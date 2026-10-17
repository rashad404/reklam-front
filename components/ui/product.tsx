"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MoreHorizontal } from "lucide-react";
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
      <span className="badge-dot" aria-hidden="true" />
      {t.has(value) ? t(value) : value}
    </span>
  );
}
export function PageHead({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="page-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-head-text">{description}</p>}
      </div>
      {children && <div className="page-head-actions">{children}</div>}
    </header>
  );
}
const formatSizes: Record<string, [number, number]> = {
  banner_300x250: [300, 250],
  banner_728x90: [728, 90],
  banner_320x50: [320, 50],
};
// A to-scale outline of the ad slot, so formats read at a glance.
export function FormatGlyph({ format }: { format: string }) {
  const t = useTranslations("product");
  const size = formatSizes[format];
  const scale = size ? Math.min(30 / size[0], 22 / size[1]) : 0;
  return (
    <span className="format-glyph">
      <span className="format-shape" aria-hidden="true">
        {size ? (
          <span style={{ width: size[0] * scale, height: size[1] * scale }} />
        ) : (
          <span className="format-lines" />
        )}
      </span>
      {size
        ? `${size[0]}×${size[1]}`
        : t(format === "text" ? "textFormat" : format)}
    </span>
  );
}
export function RowMenu({
  items,
}: {
  items: {
    label: string;
    onSelect: () => void;
    danger?: boolean;
    disabled?: boolean;
  }[];
}) {
  const t = useTranslations("product");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function outside(e: PointerEvent) {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    }
    function escape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    box.current?.querySelector<HTMLButtonElement>("[role=menuitem]")?.focus();
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <div className="row-menu" ref={box}>
      <button
        type="button"
        className="icon-button"
        aria-label={t("moreActions")}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="row-menu-list" role="menu">
          {items.map((item) => (
            <button
              type="button"
              role="menuitem"
              key={item.label}
              className={item.danger ? "danger" : undefined}
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
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
