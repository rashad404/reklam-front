'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/lib/navigation';
import { User, Shield, ChevronRight, Phone, Wallet, ExternalLink, Edit2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import AuthRequiredCard from '@/components/auth/AuthRequiredCard';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import apiClient from '@/lib/api/client';

export default function SettingsPage() {
  const t = useTranslations();
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    apiClient.get('/auth/user')
      .then(res => setUser(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (authLoading || loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <AuthRequiredCard />;
  if (!user) return null;

  const settingsMenu = [
    {
      id: 'profile',
      title: t('settings.profile.title'),
      description: t('settings.profile.description'),
      icon: User,
      href: '/settings/profile',
      color: 'text-[#FF3131]',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    {
      id: 'security',
      title: t('settings.security.title'),
      description: t('settings.security.description'),
      icon: Shield,
      href: '/settings/security',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{t('settings.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{t('settings.manageAccount')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF3131] to-red-600 p-0.5">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#FF3131]">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.wallet_id && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                  <Wallet className="w-3.5 h-3.5" />
                  {t('settings.connectedViaWallet')}
                </div>
              )}
            </div>

            {user.phone && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <Phone className="w-4 h-4" />
                <span>{user.phone}</span>
              </div>
            )}

            {user.wallet_id ? (
              <a
                href={`${process.env.NEXT_PUBLIC_WALLET_URL || 'https://kimlik.az'}/settings/profile?return_url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/settings' : '')}`}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                {t('settings.editOnWallet')}
              </a>
            ) : (
              <Link href="/settings/profile" className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                <Edit2 className="w-4 h-4" />
                {t('settings.profile.editProfile')}
              </Link>
            )}
          </div>
        </div>

        {/* Settings Menu */}
        <div className="lg:col-span-2 space-y-3">
          {settingsMenu.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.id} href={item.href} className="card hover-lift flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
