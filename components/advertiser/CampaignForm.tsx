"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api/client";
import { Notice, Failure } from "@/components/ui/product";
import AdPreview, { type Creative } from "./AdPreview";
const sizes = ["300x250", "728x90", "320x50"];
interface Form {
  name: string;
  title: string;
  description: string;
  destination: string;
  images: Record<string, string>;
  pricing: string;
  bid: string;
  budget: string;
  start: string;
  end: string;
}
const initial: Form = {
  name: "",
  title: "",
  description: "",
  destination: "",
  images: {},
  pricing: "cpc",
  bid: "0.05",
  budget: "10",
  start: "",
  end: "",
};
export default function CampaignForm({ campaignId }: { campaignId?: number }) {
  const t = useTranslations("product"),
    router = useRouter(),
    { user, refresh } = useAuth();
  const [form, setForm] = useState<Form>(initial),
    [step, setStep] = useState(1),
    [loading, setLoading] = useState(!!campaignId),
    [failed, setFailed] = useState(false),
    [error, setError] = useState(false),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [uploadError, setUploadError] = useState(false),
    [tab, setTab] = useState("text");
  const key = useRef("");
  const hydrated = useRef(false);
  const draftKey = `reklam-draft:${user?.id}:${campaignId || "new"}`;
  useEffect(() => {
    let alive = true;
    key.current = crypto.randomUUID();
    async function load() {
      try {
        if (campaignId) {
          const r = await api.get(`/campaigns/${campaignId}`);
          const c = r.data.data,
            ads = c.ads as Creative[];
          const text = ads.find((a) => a.ad_format === "text");
          const first = text || ads[0];
          if (alive)
            setForm({
              name: c.name,
              title: text?.title || "",
              description: first?.description || "",
              destination: first?.destination_url || "",
              images: Object.fromEntries(
                ads
                  .filter((a) => a.image_url)
                  .map((a) => [
                    a.ad_format.replace("banner_", ""),
                    a.image_url!,
                  ]),
              ),
              pricing: c.cpc_bid ? "cpc" : "cpm",
              bid: String(c.cpc_bid || c.cpm_bid || ""),
              budget: String(c.budget),
              start: c.start_date?.slice(0, 10) || "",
              end: c.end_date?.slice(0, 10) || "",
            });
        } else {
          const saved = sessionStorage.getItem(draftKey);
          if (saved && alive) {
            const draft = JSON.parse(saved);
            setForm(draft.form);
            key.current = draft.key || key.current;
          }
        }
      } catch {
        if (alive) setFailed(true);
      } finally {
        hydrated.current = true;
        if (alive) setLoading(false);
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, [campaignId, draftKey]);
  useEffect(() => {
    if (hydrated.current && !campaignId)
      sessionStorage.setItem(
        draftKey,
        JSON.stringify({ form, key: key.current }),
      );
  }, [form, campaignId, draftKey]);
  function set(field: keyof Form, value: string) {
    setForm((s) => ({ ...s, [field]: value }));
  }
  async function upload(size: string, file: File) {
    setUploading(true);
    setUploadError(false);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("size", size);
      const r = await api.post("/upload/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((s) => ({
        ...s,
        images: { ...s.images, [size]: r.data.data.url },
      }));
      setTab(`banner_${size}`);
    } catch {
      setUploadError(true);
    } finally {
      setUploading(false);
    }
  }
  const creatives: Creative[] = [
    ...Object.entries(form.images)
      .filter(([, url]) => url)
      .map(([size, url]) => ({
        ad_format: `banner_${size}`,
        title: "",
        description: "",
        image_url: url,
        destination_url: form.destination,
      })),
    ...(form.title.trim()
      ? [
          {
            ad_format: "text",
            title: form.title.trim(),
            description: form.description,
            destination_url: form.destination,
          },
        ]
      : []),
  ];
  const preview = creatives.find((a) => a.ad_format === tab) ||
    creatives[0] || {
      ad_format: "text",
      title: form.title,
      description: form.description,
    };
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    setBusy(true);
    setError(false);
    try {
      const payload = {
        request_key: key.current,
        name:
          form.name.trim() ||
          form.title.trim() ||
          new URL(form.destination).hostname,
        type: Object.values(form.images).some(Boolean) ? "display" : "text",
        budget: Number(form.budget),
        daily_budget: null,
        cpc_bid: form.pricing === "cpc" ? Number(form.bid) : null,
        cpm_bid: form.pricing === "cpm" ? Number(form.bid) : null,
        start_date: form.start || null,
        end_date: form.end || null,
        ads: creatives,
      };
      if (campaignId) await api.put(`/campaigns/${campaignId}`, payload);
      else await api.post("/campaigns", payload);
      sessionStorage.removeItem(draftKey);
      await refresh();
      router.push("/advertiser/campaigns");
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <p>{t("loading")}</p>;
  if (failed) return <Failure retry={() => window.location.reload()} />;
  return (
    <div className="stack">
      <h1>{t(campaignId ? "edit" : "createCampaign")}</h1>
      <div className="steps">
        {["content", "budget", "review"].map((label, i) => (
          <span
            className="step"
            key={label}
            aria-current={step === i + 1 ? "step" : undefined}
          >
            <strong>{i + 1}</strong>
            {t(label)}
          </span>
        ))}
      </div>
      <div className="editor">
        <form className="card stack" onSubmit={submit}>
          {error && <Notice error>{t("saveError")}</Notice>}
          {step === 1 && (
            <>
              <label className="field">
                {t("name")}
                <input
                  value={form.name}
                  maxLength={120}
                  onChange={(e) => set("name", e.target.value)}
                />
              </label>
              <label className="field">
                {t("destination")}
                <input
                  type="url"
                  required
                  pattern="https?://.*"
                  value={form.destination}
                  onChange={(e) => set("destination", e.target.value)}
                  placeholder="https://example.com"
                />
              </label>
              <label className="field">
                {t("adTitle")}
                <input
                  maxLength={120}
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                />
              </label>
              <label className="field">
                {t("adText")}
                <textarea
                  maxLength={240}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </label>
              <p className="text-sm">{t("uploadHint")}</p>
              {uploadError && <Notice error>{t("uploadError")}</Notice>}
              {sizes.map((size) => (
                <div className="stack" key={size}>
                  <label className="field">
                    {t("image")} {size}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void upload(size, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {form.images[size] && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() =>
                        setForm((s) => ({
                          ...s,
                          images: { ...s.images, [size]: "" },
                        }))
                      }
                    >
                      {t("remove")} {size}
                    </button>
                  )}
                </div>
              ))}
            </>
          )}
          {step === 2 && (
            <>
              <label className="field">
                {t("pricing")}
                <select
                  value={form.pricing}
                  onChange={(e) => set("pricing", e.target.value)}
                >
                  <option value="cpc">{t("cpc")}</option>
                  <option value="cpm">{t("cpm")}</option>
                </select>
              </label>
              <div className="two-col">
                <label className="field">
                  {t("bid")}
                  <input
                    type="number"
                    min="0.01"
                    max="1000"
                    step="0.01"
                    required
                    value={form.bid}
                    onChange={(e) => set("bid", e.target.value)}
                  />
                </label>
                <label className="field">
                  {t("totalBudget")}
                  <input
                    type="number"
                    min="1"
                    max="1000000"
                    step="0.01"
                    required
                    value={form.budget}
                    onChange={(e) => set("budget", e.target.value)}
                  />
                </label>
              </div>
              <div className="two-col">
                <label className="field">
                  {t("startDate")}
                  <input
                    type="date"
                    value={form.start}
                    onChange={(e) => set("start", e.target.value)}
                  />
                </label>
                <label className="field">
                  {t("endDate")}
                  <input
                    type="date"
                    min={form.start || undefined}
                    value={form.end}
                    onChange={(e) => set("end", e.target.value)}
                  />
                </label>
              </div>
              <p className="text-sm">{t("timezone")}</p>
            </>
          )}
          {step === 3 && (
            <>
              <h2>{form.name || form.title || form.destination}</h2>
              <p className="break-all">{form.destination}</p>
              <dl className="stack">
                <div>
                  {t(form.pricing)}: {form.bid} AZN
                </div>
                <div>
                  {t("totalBudget")}: {form.budget}
                </div>
                <div>
                  {t("format")}:{" "}
                  {creatives
                    .map((a) => a.ad_format.replace("banner_", ""))
                    .join(", ")}
                </div>
                {form.start && (
                  <div>
                    {t("startDate")}: {form.start}
                  </div>
                )}
                {form.end && (
                  <div>
                    {t("endDate")}: {form.end}
                  </div>
                )}
              </dl>
              <Notice>{t("reviewHint")}</Notice>
            </>
          )}
          <div className="row between">
            {step > 1 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStep(step - 1)}
                disabled={busy}
              >
                {t("back")}
              </button>
            )}
            <button
              className="btn-primary"
              disabled={busy || uploading || !creatives.length}
            >
              {busy
                ? t("loading")
                : step === 3
                  ? t(campaignId ? "save" : "submitReview")
                  : t("next")}
            </button>
          </div>
        </form>
        <aside className="preview-panel stack">
          <h2>{t("preview")}</h2>
          <div className="demo-stage">
            <AdPreview ad={preview} />
            <div className="demo-tabs">
              {creatives.map((a) => (
                <button
                  type="button"
                  aria-pressed={preview.ad_format === a.ad_format}
                  key={a.ad_format}
                  onClick={() => setTab(a.ad_format)}
                >
                  {a.ad_format.replace("banner_", "")}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm">{t("previewHint")}</p>
          <Notice>{t("deliveryHint")}</Notice>
        </aside>
      </div>
    </div>
  );
}
