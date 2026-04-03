'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthRequiredCard from '@/components/auth/AuthRequiredCard';
import LoadingSpinner from '@/components/auth/LoadingSpinner';

export default function AdUnitsPage() {
  const t = useTranslations('publisher');
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <AuthRequiredCard />;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('adUnits')}</h1>
        <Link href="/publisher/ad-units/create" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          {t('createAdUnit')}
        </Link>
      </div>

      {/* Empty State */}
      <div className="card text-center py-16">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('noAdUnits')}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{t('noAdUnitsDesc')}</p>
        <Link href="/publisher/ad-units/create" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('createAdUnit')}
        </Link>
      </div>
    </div>
  );
}
