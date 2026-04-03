'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthRequiredCard from '@/components/auth/AuthRequiredCard';
import LoadingSpinner from '@/components/auth/LoadingSpinner';

export default function CampaignsPage() {
  const t = useTranslations('advertiser');
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <AuthRequiredCard />;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('campaigns')}</h1>
        <Link href="/advertiser/campaigns/create" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          {t('createCampaign')}
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`${t('campaigns')}...`}
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
      </div>

      <div className="card text-center py-16">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('noCampaigns')}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{t('noCampaignsDesc')}</p>
        <Link href="/advertiser/campaigns/create" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('createCampaign')}
        </Link>
      </div>
    </div>
  );
}
