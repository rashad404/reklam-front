import { Gate } from "@/components/ui/product";
import CampaignForm from "@/components/advertiser/CampaignForm";
export default function Page() {
  return (
    <Gate>
      <div className="wrap page">
        <CampaignForm />
      </div>
    </Gate>
  );
}
