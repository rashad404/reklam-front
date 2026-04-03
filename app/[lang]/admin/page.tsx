'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { Users, Megaphone, Eye, DollarSign, Shield, Image } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthRequiredCard from '@/components/auth/AuthRequiredCard';
import LoadingSpinner from '@/components/auth/LoadingSpinner';

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <AuthRequiredCard />;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{t('dashboard')}</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: 'Total Publishers', value: '0', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { icon: Megaphone, label: 'Total Advertisers', value: '0', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
          { icon: Eye, label: 'Total Impressions', value: '0', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
          { icon: DollarSign, label: 'Total Revenue', value: '0 AZN', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
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

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/admin/publishers" className="card hover-lift flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('publishers')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Review & approve publishers</p>
          </div>
        </Link>
        <Link href="/admin/ads" className="card hover-lift flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Image className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('ads')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Review & approve ad creatives</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
