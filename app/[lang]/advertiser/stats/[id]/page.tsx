import Reports from "@/components/layout/Reports";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Reports
      scope="advertiser"
      selected={Number(id) ? `campaign:${Number(id)}` : ""}
    />
  );
}
