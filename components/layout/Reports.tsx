"use client";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useResource } from "@/hooks/useResource";
import { Gate, Failure } from "@/components/ui/product";
import DailyChart from "@/components/layout/DailyChart";
import type { Day, Metric } from "@/components/layout/DailyChart";
import { formatDate } from "@/lib/utils/date";
import api from "@/lib/api/client";
interface Report {
  totals: {
    impressions: number;
    clicks: number;
    unique_impressions: number;
    unique_clicks: number;
    ctr: number;
  };
  daily: Day[];
  by_device?: {
    label: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }[];
}
const presets = [7, 30, 90];
function bakuDate(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baku" }).format(
    date,
  );
}
interface Option {
  id: number;
  name: string;
}
// The list endpoints paginate by 20; the selector needs every item.
function useAllItems(url: string) {
  const [items, setItems] = useState<Option[]>([]);
  useEffect(() => {
    let alive = true;
    async function load() {
      const all: Option[] = [];
      for (let page = 1, last = 1; page <= last; page++) {
        const r = await api.get(`${url}?page=${page}`);
        all.push(...r.data.data.data);
        last = r.data.data.last_page;
      }
      if (alive) setItems(all);
    }
    load().catch(() => {});
    return () => {
      alive = false;
    };
  }, [url]);
  return items;
}
function Content({
  scope,
  initial,
}: {
  scope: "advertiser" | "publisher";
  initial: number | null;
}) {
  const t = useTranslations("product"),
    locale = useLocale();
  const today = bakuDate(0);
  const [preset, setPreset] = useState<number | null>(30),
    [from, setFrom] = useState(() => bakuDate(29)),
    [to, setTo] = useState(today),
    [range, setRange] = useState(() => ({ from: bakuDate(29), to: today })),
    [metric, setMetric] = useState<Metric>("impressions");
  const publisher = scope === "publisher";
  const [selected, setSelected] = useState(initial),
    [lastInitial, setLastInitial] = useState(initial);
  // Follow navigation, e.g. the sidebar link back to all items.
  if (initial !== lastInitial) {
    setLastInitial(initial);
    setSelected(initial);
  }
  const options = useAllItems(publisher ? "/ad-units" : "/campaigns");
  const endpoint = selected
    ? publisher
      ? `/stats/ad-unit/${selected}`
      : `/stats/campaign/${selected}`
    : `/stats/${scope}`;
  const data = useResource<Report>(
    `${endpoint}?from=${range.from}&to=${range.to}`,
  );
  const subject = options.find((o) => o.id === selected);
  function select(value: string) {
    const id = value ? Number(value) : null;
    setSelected(id);
    // Keep the address shareable without remounting the report.
    const url = new URL(window.location.href);
    if (publisher) {
      if (id) url.searchParams.set("unit", String(id));
      else url.searchParams.delete("unit");
    } else {
      url.pathname = url.pathname.replace(
        /\/stats(\/\d+)?$/,
        id ? `/stats/${id}` : "/stats",
      );
    }
    window.history.replaceState(null, "", url);
  }
  // Keep the previous report on screen while a new range loads.
  const [shown, setShown] = useState<Report | null>(null);
  if (data.data && data.data !== shown) setShown(data.data);
  const report = data.data ?? (data.loading ? shown : null);
  const numbers = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  function choose(days: number) {
    const start = bakuDate(days - 1);
    setPreset(days);
    setFrom(start);
    setTo(today);
    setRange({ from: start, to: today });
  }
  const labels: Record<Metric, string> = {
    impressions: t("impressions"),
    clicks: t("clicks"),
    ctr: t("ctr"),
  };
  const period = `${formatDate(range.from, locale)} - ${formatDate(range.to, locale)}`;
  const totals = report?.totals,
    busiest = report?.daily.reduce<Day | null>(
      (best, d) => (d.impressions > (best?.impressions ?? 0) ? d : best),
      null,
    ),
    activeDays = report?.daily.filter((d) => d.impressions > 0).length ?? 0;
  return (
    <div className="wrap page stack">
      <header className="report-head">
        <div>
          {selected && <p className="eyebrow">{t("reports")}</p>}
          <h1>{(selected && subject?.name) || t("reports")}</h1>
          <p className="text-sm">{period}</p>
        </div>
        <div className="report-controls">
          <label className="select-field report-filter">
            <span className="sr-only">
              {t(publisher ? "placementColumn" : "campaignColumn")}
            </span>
            <select
              value={selected ?? ""}
              onChange={(e) => select(e.target.value)}
            >
              <option value="">
                {t(publisher ? "allPlacements" : "allCampaigns")}
              </option>
              {selected && !subject && (
                <option value={selected}>#{selected}</option>
              )}
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </label>
          <div className="range-picker" role="group" aria-label={t("period")}>
            {presets.map((days) => (
              <button
                type="button"
                key={days}
                aria-pressed={preset === days}
                onClick={() => choose(days)}
              >
                {t("rangeDays", { count: days })}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={preset === null}
              onClick={() => setPreset(null)}
            >
              {t("rangeCustom")}
            </button>
          </div>
        </div>
      </header>
      {preset === null && (
        <form
          className="row range-custom"
          onSubmit={(e) => {
            e.preventDefault();
            setRange({ from, to });
          }}
        >
          <label className="field">
            {t("from")}
            <input
              type="date"
              required
              max={to}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="field">
            {t("to")}
            <input
              type="date"
              required
              min={from}
              max={today}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <button className="btn-primary self-end">{t("apply")}</button>
        </form>
      )}
      {data.error ? (
        <Failure retry={data.retry} />
      ) : !report || !totals ? (
        <p>{t("loading")}</p>
      ) : (
        <div
          className={`stack report-body ${data.loading ? "refreshing" : ""}`}
          aria-busy={data.loading}
        >
          <div className="metrics report-metrics" role="group">
            {(
              [
                ["impressions", totals.impressions, totals.unique_impressions],
                ["clicks", totals.clicks, totals.unique_clicks],
                ["ctr", totals.ctr, null],
              ] as [Metric, number, number | null][]
            ).map(([key, total, unique]) => (
              <button
                type="button"
                className="metric"
                key={key}
                aria-pressed={metric === key}
                onClick={() => setMetric(key)}
              >
                <span>{labels[key]}</span>
                <strong>
                  {numbers.format(total)}
                  {key === "ctr" ? "%" : ""}
                </strong>
                <small>
                  {unique === null
                    ? t("ctrHint")
                    : t("uniqueCount", { count: numbers.format(unique) })}
                </small>
              </button>
            ))}
          </div>
          <section className="card report-chart">
            <div className="row between">
              <h2>{labels[metric]}</h2>
              <span className="text-sm muted">{t("perDay")}</span>
            </div>
            <DailyChart
              days={report.daily}
              metric={metric}
              locale={locale}
              labels={labels}
              label={`${labels[metric]}, ${t("perDay")}: ${period}`}
              empty={totals.impressions === 0 ? t("noTraffic") : null}
            />
          </section>
          {totals.impressions > 0 && (
            <div className="report-grid">
              <section className="card stack">
                <h2>{t("periodSummary")}</h2>
                <dl className="summary-list">
                  <div>
                    <dt>{t("averagePerDay")}</dt>
                    <dd>
                      {numbers.format(
                        Math.round(totals.impressions / report.daily.length),
                      )}
                    </dd>
                  </div>
                  {busiest && (
                    <div>
                      <dt>{t("busiestDay")}</dt>
                      <dd>
                        {formatDate(busiest.date, locale)}
                        <span className="muted">
                          {" · "}
                          {numbers.format(busiest.impressions)}
                        </span>
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt>{t("activeDays")}</dt>
                    <dd>
                      {activeDays} / {report.daily.length}
                    </dd>
                  </div>
                </dl>
              </section>
              {!!report.by_device?.length && (
                <section className="card stack">
                  <h2>{t("devices")}</h2>
                  <ul className="share-list">
                    {report.by_device.map((d) => {
                      const share = (d.impressions / totals.impressions) * 100;
                      return (
                        <li key={d.label}>
                          <div className="row between">
                            <span>
                              {["desktop", "mobile", "tablet"].includes(d.label)
                                ? t(d.label)
                                : d.label}
                            </span>
                            <span>
                              <strong>{numbers.format(d.impressions)}</strong>
                              <span className="muted">
                                {" "}
                                {numbers.format(Math.round(share))}%
                              </span>
                            </span>
                          </div>
                          <div className="share-track">
                            <div
                              className="share-bar"
                              style={{ width: `${Math.min(100, share)}%` }}
                            />
                          </div>
                          <p className="text-sm">
                            {labels.clicks}: {numbers.format(d.clicks)} ·{" "}
                            {labels.ctr} {numbers.format(d.ctr)}%
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </div>
          )}
          <details className="report-table">
            <summary>{t("dailyTable")}</summary>
            <div className="table-wrap">
              <table>
                <caption className="sr-only">{t("dailyTable")}</caption>
                <thead>
                  <tr>
                    {["date", "impressions", "clicks", "ctr"].map((k) => (
                      <th key={k} scope="col">
                        {t(k)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...report.daily].reverse().map((d) => (
                    <tr key={d.date}>
                      <th scope="row">{formatDate(d.date, locale)}</th>
                      <td>{numbers.format(d.impressions)}</td>
                      <td>{numbers.format(d.clicks)}</td>
                      <td>{numbers.format(d.ctr)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}
      <details className="muted text-sm">
        <summary>{t("metricHelpTitle")}</summary>
        <p>{t("metricHelp")}</p>
        <p>{t("timezone")}</p>
      </details>
    </div>
  );
}
export default function Reports({
  scope,
  selected = null,
}: {
  scope: "advertiser" | "publisher";
  selected?: number | null;
}) {
  return (
    <Gate>
      <Content scope={scope} initial={selected} />
    </Gate>
  );
}
