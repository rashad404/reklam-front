import { redirect } from "@/lib/navigation";
// Placements now live under each site.
export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect({ href: "/publisher/sites", locale: lang });
}
