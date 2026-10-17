import Reports from "@/components/layout/Reports";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ site?: string; unit?: string }>;
}) {
  const { site, unit } = await searchParams;
  const selected = Number(unit)
    ? `unit:${Number(unit)}`
    : Number(site)
      ? `site:${Number(site)}`
      : "";
  return <Reports scope="publisher" selected={selected} />;
}
