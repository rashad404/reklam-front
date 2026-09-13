"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useResource } from "@/hooks/useResource";
import { Gate, Failure, Notice } from "@/components/ui/product";
interface Daily {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
}
interface Report {
  totals: {
    impressions: number;
    clicks: number;
    unique_impressions: number;
    unique_clicks: number;
    ctr: number;
  };
  daily: Daily[];
  by_device?: {
    label: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }[];
}
function Content({ endpoint }: { endpoint: string }) {
  const t = useTranslations("product"),
    locale = useLocale();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Baku",
  }).format(new Date());
  const ago = new Date();
  ago.setDate(ago.getDate() - 29);
  const [from, setFrom] = useState(
      new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baku" }).format(ago),
    ),
    [to, setTo] = useState(today),
    [range, setRange] = useState({ from, to });
  const data = useResource<Report>(
    `${endpoint}?from=${range.from}&to=${range.to}`,
  );
  const numbers = new Intl.NumberFormat(locale);
  return (
    <div className="wrap page stack">
      <h1>{t("reports")}</h1>
      <form
        className="row"
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
      <p className="text-sm">{t("timezone")}</p>
      {data.error ? (
        <Failure retry={data.retry} />
      ) : data.loading ? (
        <p>{t("loading")}</p>
      ) : (
        data.data && (
          <>
            <div className="metrics">
              {[
                ["impressions", "impressions"],
                ["clicks", "clicks"],
                ["ctr", "ctr"],
                ["uniqueImpressions", "unique_impressions"],
                ["uniqueClicks", "unique_clicks"],
              ].map(([label, key]) => (
                <div className="metric" key={key}>
                  <span>{t(label)}</span>
                  <strong>
                    {numbers.format(
                      data.data!.totals[key as keyof Report["totals"]],
                    )}
                    {key === "ctr" ? "%" : ""}
                  </strong>
                </div>
              ))}
            </div>
            {data.data.totals.impressions === 0 && (
              <Notice>{t("noTraffic")}</Notice>
            )}
            <div className="table-wrap">
              <table>
                <caption className="sr-only">{t("reports")}</caption>
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
                  {data.data.daily.map((d) => (
                    <tr key={d.date}>
                      <th scope="row">{d.date}</th>
                      <td>{numbers.format(d.impressions)}</td>
                      <td>{numbers.format(d.clicks)}</td>
                      <td>{numbers.format(d.ctr)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!!data.data.by_device?.length && (
              <div className="table-wrap">
                <table>
                  <caption className="sr-only">{t("reports")}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{t("format")}</th>
                      <th scope="col">{t("impressions")}</th>
                      <th scope="col">{t("clicks")}</th>
                      <th scope="col">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.by_device.map((d) => (
                      <tr key={d.label}>
                        <th scope="row">{d.label}</th>
                        <td>{d.impressions}</td>
                        <td>{d.clicks}</td>
                        <td>{d.ctr}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )
      )}
      <Notice>{t("metricHelp")}</Notice>
    </div>
  );
}
export default function Reports({ endpoint }: { endpoint: string }) {
  return (
    <Gate>
      <Content endpoint={endpoint} />
    </Gate>
  );
}
