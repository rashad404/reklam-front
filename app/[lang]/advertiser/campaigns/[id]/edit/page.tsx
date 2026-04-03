'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthRequiredCard from '@/components/auth/AuthRequiredCard';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import CampaignForm from '@/components/advertiser/CampaignForm';

export default function EditCampaignPage() {
  const params = useParams();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <AuthRequiredCard />;

  return <CampaignForm campaignId={Number(params.id)} />;
}
