'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { DollarSign, Eye, MousePointer, TrendingUp, Plus, Wallet, Globe, Code, Zap, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import { usePathname } from 'next/navigation';
import { openWalletLogin, getLocaleFromPathname } from '@/lib/utils/walletAuth';
import apiClient from '@/lib/api/client';
import { PLATFORM_CONFIG } from '@/lib/config';

export default function PublisherPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (isAuthenticated) return <PublisherDashboard />;
  return <PublisherLanding />;
}

function PublisherLanding() {
  const t = useTranslations();
  const tp = useTranslations('publisher.landing');
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const handleLogin = () => { openWalletLogin({ locale }); };

  const embedExample = `<div id="reklam-ad" data-unit="YOUR_ID" data-format="300x250"></div>\n<script async src="https://reklam.biz/serve.js"></script>`;

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-green-950/20" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              {t('home.forPublishers.title')}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.forPublishers.description')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {tp('revenueShare', { revenueShare: PLATFORM_CONFIG.publisherRevenueShare })} - {t('publisher.minWithdraw', { minWithdrawal: PLATFORM_CONFIG.minWithdrawal })}
            </p>
            <button onClick={handleLogin} className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4 !bg-green-600 hover:!bg-green-700">
              <LogIn className="w-5 h-5" />
              {t('nav.getStarted')}
            </button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: DollarSign, title: tp('revenueShare', { revenueShare: PLATFORM_CONFIG.publisherRevenueShare }), desc: tp('revenueShareDesc', { revenueShare: PLATFORM_CONFIG.publisherRevenueShare }), color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
            { icon: Code, title: tp('easyIntegration'), desc: tp('easyIntegrationDesc'), color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
            { icon: Zap, title: tp('realtimeEarnings'), desc: tp('realtimeEarningsDesc'), color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
          ].map((f, i) => (
            <div key={i} className="card text-center hover-lift">
              <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mx-auto mb-4`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('publisher.embedCode')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{tp('addToWebsite')}</p>
            <pre className="bg-gray-900 dark:bg-gray-800 rounded-xl p-6 text-left text-sm text-green-400 overflow-x-auto">{embedExample}</pre>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-10">{tp('supportedFormats')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {[
            { name: tp('leaderboard'), size: '728x90' },
            { name: tp('mediumRect'), size: '300x250' },
            { name: tp('mobileBanner'), size: '320x50' },
            { name: tp('native'), size: tp('responsive') },
            { name: tp('text'), size: tp('inline') },
          ].map((f, i) => (
            <div key={i} className="card text-center py-4">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{f.name}</p>
              <p className="text-xs text-gray-500">{f.size}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tp('ctaTitle')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{tp('ctaDesc')}</p>
        <button onClick={handleLogin} className="btn-primary inline-flex items-center gap-2 !bg-green-600 hover:!bg-green-700">
          <LogIn className="w-4 h-4" />
          {t('auth.loginWithWallet')}
        </button>
      </section>
    </div>
  );
}

function PublisherDashboard() {
  const t = useTranslations('publisher');
  const [stats, setStats] = useState({ total_earned: 0, impressions: 0, clicks: 0, active_ad_units: 0 });
  const [totalUnits, setTotalUnits] = useState(0);

  useEffect(() => {
    Promise.all([
      apiClient.get('/publisher/dashboard').catch(() => ({ data: { data: {} } })),
      apiClient.get('/ad-units').catch(() => ({ data: { data: { total: 0 } } })),
    ]).then(([dashRes, unitsRes]) => {
      setStats(dashRes.data.data || {});
      setTotalUnits(unitsRes.data.data?.total || unitsRes.data.data?.data?.length || 0);
    });
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h1>
        <Link href="/publisher/ad-units/create" className="btn-primary flex items-center gap-2 text-sm !bg-green-600 hover:!bg-green-700">
          <Plus className="w-4 h-4" /> {t('createAdUnit')}
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: DollarSign, label: t('totalEarned'), value: `${Number(stats.total_earned || 0).toFixed(2)} AZN`, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
          { icon: Wallet, label: t('pendingEarnings'), value: `${Number(stats.balance || 0).toFixed(2)} AZN`, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
          { icon: Eye, label: t('adUnits'), value: String(totalUnits), color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { icon: MousePointer, label: t('earnings'), value: `${stats.clicks || 0}`, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
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
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/publisher/ad-units" className="card hover-lift flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-blue-600" /></div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('adUnits')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{totalUnits} {t('adUnits').toLowerCase()}</p>
          </div>
        </Link>
        <Link href="/publisher/earnings" className="card hover-lift flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><DollarSign className="w-6 h-6 text-green-600" /></div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('earnings')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('withdraw')}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
