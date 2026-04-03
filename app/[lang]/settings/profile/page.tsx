'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/lib/navigation';
import { ArrowLeft, User, Mail, Phone, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import AuthRequiredCard from '@/components/auth/AuthRequiredCard';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import apiClient from '@/lib/api/client';

export default function ProfilePage() {
  const t = useTranslations();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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

  const fields = [
    { icon: User, label: t('settings.profile.name'), value: user.name },
    { icon: Mail, label: t('settings.profile.email'), value: user.email },
    { icon: Phone, label: t('settings.profile.phone'), value: user.phone || '-' },
    { icon: Calendar, label: t('settings.profile.memberSince'), value: new Date(user.created_at).toLocaleDateString() },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/settings" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.profile.title')}</h1>
      </div>

      <div className="card">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF3131] to-red-600 p-0.5">
            <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-[#FF3131]">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {fields.map((field, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <field.icon className="w-5 h-5 text-gray-400 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">{field.label}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{field.value}</p>
              </div>
            </div>
          ))}
        </div>

        {user.wallet_id && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <a
              href={`${process.env.NEXT_PUBLIC_WALLET_URL || 'https://kimlik.az'}/settings/profile`}
              target="_blank"
              rel="noopener"
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
            >
              {t('settings.editOnWallet')}
            </a>
            <p className="text-xs text-gray-500 text-center mt-2">
              {t('settings.connectedViaWallet')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
