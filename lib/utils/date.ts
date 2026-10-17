// Browsers lack Azerbaijani month names and print "2027 M03 13" for az.
// Russian long dates end with "г.", which doubles a sentence's final period.
const azMonths = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avqust",
  "sentyabr",
  "oktyabr",
  "noyabr",
  "dekabr",
];
export function formatDate(
  value: string,
  locale: string,
  style: "long" | "short" = "long",
) {
  const date = new Date(value);
  if (locale !== "az")
    return new Intl.DateTimeFormat(
      locale,
      style === "long"
        ? { dateStyle: "long", timeZone: "Asia/Baku" }
        : { day: "numeric", month: "short", timeZone: "Asia/Baku" },
    )
      .format(date)
      .replace(/\s*г\.$/, "");
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone: "Asia/Baku",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const month = azMonths[Number(parts.month) - 1];
  return style === "long"
    ? `${parts.day} ${month} ${parts.year}`
    : `${parts.day} ${month.slice(0, 3)}`;
}
