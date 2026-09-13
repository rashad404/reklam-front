import Reports from "@/components/layout/Reports";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Reports endpoint={`/stats/campaign/${Number(id)}`} />;
}
