'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { DollarSign, Eye, MousePointer, TrendingUp, Plus, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthRequiredCard from '@/components/auth/AuthRequiredCard';
import LoadingSpinner from '@/components/auth/LoadingSpinner';

export default function AdvertiserDashboard() {
  const t = useTranslations('advertiser');
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <AuthRequiredCard />;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h1>
        <Link href="/advertiser/campaigns/create" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          {t('createCampaign')}
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: DollarSign, label: t('balance'), value: '0.00 AZN', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
          { icon: Eye, label: t('impressions'), value: '0', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { icon: MousePointer, label: t('clicks'), value: '0', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
          { icon: TrendingUp, label: t('ctr'), value: '0%', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
        ].map((stat, i) => (
          <div key={i} className="card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Link href="/advertiser/campaigns" className="card hover-lift flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#FF3131]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('campaigns')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">0 active campaigns</p>
          </div>
        </Link>
        <Link href="/advertiser/billing" className="card hover-lift flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('billing')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('deposit')}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
