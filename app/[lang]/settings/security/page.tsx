'use client';

import { useState } from 'react';
import { Link } from '@/lib/navigation';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Wallet, Check, X, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import AuthRequiredCard from '@/components/auth/AuthRequiredCard';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import apiClient from '@/lib/api/client';

export default function SecurityPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <AuthRequiredCard />;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await apiClient.post('/auth/logout');
    } catch {}
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('authStateChanged'));
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/settings" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.security.title')}</h1>
      </div>

      <div className="space-y-4">
        {/* Connected Accounts */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t('settings.security.connectedAccounts')}</h2>
          <div className="flex items-center gap-4 py-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">Kimlik.az</p>
              <p className="text-sm text-gray-500">
                {user?.wallet_id ? t('settings.security.kimlikConnected') : t('settings.security.kimlikNotConnected')}
              </p>
            </div>
            {user?.wallet_id ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <X className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="card">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 py-2 text-red-600 hover:text-red-700"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t('settings.security.logout')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
