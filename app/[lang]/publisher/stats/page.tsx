import Reports from "@/components/layout/Reports";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string }>;
}) {
  const { unit } = await searchParams;
  return <Reports scope="publisher" selected={Number(unit) || null} />;
}
