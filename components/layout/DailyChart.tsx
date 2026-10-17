"use client";
import { useEffect, useRef, useState } from "react";
import { formatDate } from "@/lib/utils/date";
export type Metric = "impressions" | "clicks" | "ctr";
export interface Day {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
}
const height = 232,
  top = 12,
  bottom = 30,
  left = 46,
  right = 6;
// Round the axis maximum up to 1, 2 or 5 times a power of ten.
function niceMax(value: number) {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value)),
    step = value / power;
  return (step <= 1 ? 1 : step <= 2 ? 2 : step <= 5 ? 5 : 10) * power;
}
export default function DailyChart({
  days,
  metric,
  locale,
  labels,
  label,
  empty,
}: {
  days: Day[];
  metric: Metric;
  locale: string;
  labels: Record<Metric, string>;
  label: string;
  empty: string | null;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0),
    [active, setActive] = useState<number | null>(null);
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const numbers = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }),
    compact = new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    });
  const value = (v: number, short = false) =>
    metric === "ctr"
      ? `${numbers.format(v)}%`
      : (short ? compact : numbers).format(v);
  const max = niceMax(Math.max(0, ...days.map((d) => d[metric]))),
    plotWidth = Math.max(0, width - left - right),
    plotHeight = height - top - bottom,
    base = top + plotHeight,
    band = days.length ? plotWidth / days.length : 0,
    barWidth = Math.min(24, Math.max(1, band - 2)),
    radius = Math.min(4, barWidth / 2);
  // An empty range keeps only the baseline; scale ticks would be invented.
  const ticks = empty ? [0] : [0, max / 2, max],
    dateTicks = [
      ...new Set([0, Math.floor((days.length - 1) / 2), days.length - 1]),
    ].filter((i) => i >= 0);
  function bar(i: number) {
    const h = (days[i][metric] / max) * plotHeight,
      x = left + i * band + (band - barWidth) / 2,
      r = Math.min(radius, h),
      y = base - h;
    if (h <= 0) return "";
    return `M${x},${base}V${y + r}Q${x},${y} ${x + r},${y}H${x + barWidth - r}Q${x + barWidth},${y} ${x + barWidth},${y + r}V${base}Z`;
  }
  function point(clientX: number) {
    const rect = box.current?.getBoundingClientRect();
    if (!rect || !band) return;
    const i = Math.floor((clientX - rect.left - left) / band);
    setActive(Math.min(days.length - 1, Math.max(0, i)));
  }
  function key(e: React.KeyboardEvent) {
    const last = days.length - 1,
      current = active ?? last;
    const next =
      e.key === "ArrowLeft"
        ? current - 1
        : e.key === "ArrowRight"
          ? current + 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    setActive(Math.min(last, Math.max(0, next)));
  }
  const day = active === null ? null : days[active],
    tipX = active === null ? 0 : left + active * band + band / 2;
  return (
    <div
      className="chart"
      ref={box}
      onPointerMove={(e) => point(e.clientX)}
      onPointerLeave={() => setActive(null)}
    >
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={label}
        tabIndex={days.length ? 0 : -1}
        onKeyDown={key}
        onFocus={() => setActive((a) => a ?? days.length - 1)}
        onBlur={() => setActive(null)}
      >
        {width > 0 && (
          <>
            {ticks.map((t) => (
              <g key={t}>
                <line
                  className="chart-grid"
                  x1={left}
                  x2={width - right}
                  y1={base - (t / max) * plotHeight}
                  y2={base - (t / max) * plotHeight}
                />
                <text
                  x={left - 10}
                  y={base - (t / max) * plotHeight}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {value(t, true)}
                </text>
              </g>
            ))}
            {active !== null && (
              <rect
                className="chart-hover"
                x={left + active * band}
                y={top}
                width={band}
                height={plotHeight}
                rx={Math.min(6, band / 2)}
              />
            )}
            {days.map((d, i) => (
              <path
                key={d.date}
                className="chart-bar"
                d={bar(i)}
                opacity={active === null || active === i ? 1 : 0.45}
              />
            ))}
            {dateTicks.map((i) => (
              <text
                key={i}
                x={left + i * band + band / 2}
                y={height - 8}
                textAnchor={
                  i === 0 && dateTicks.length > 1
                    ? "start"
                    : i === days.length - 1 && dateTicks.length > 1
                      ? "end"
                      : "middle"
                }
              >
                {formatDate(days[i].date, locale, "short")}
              </text>
            ))}
          </>
        )}
      </svg>
      {empty && <p className="chart-empty">{empty}</p>}
      <div className="chart-tip-live" aria-live="polite">
        {day && (
          <div
            className={`chart-tip ${tipX > width / 2 ? "flip" : ""}`}
            style={{ left: tipX }}
          >
            <span className="chart-tip-date">
              {formatDate(day.date, locale)}
            </span>
            {(["impressions", "clicks", "ctr"] as Metric[]).map((m) => (
              <span
                className={`chart-tip-row ${m === metric ? "current" : ""}`}
                key={m}
              >
                <strong>
                  {m === "ctr"
                    ? `${numbers.format(day.ctr)}%`
                    : numbers.format(day[m])}
                </strong>
                {labels[m]}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
