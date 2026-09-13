import { Gate } from "@/components/ui/product";
import CampaignForm from "@/components/advertiser/CampaignForm";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Gate>
      <div className="wrap page">
        <CampaignForm campaignId={Number(id)} />
      </div>
    </Gate>
  );
}
