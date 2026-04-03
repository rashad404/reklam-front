'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { DollarSign, Eye, MousePointer, TrendingUp, Plus, CreditCard, BarChart3, Target, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import { usePathname } from 'next/navigation';
import { openWalletLogin, getLocaleFromPathname } from '@/lib/utils/walletAuth';

export default function AdvertiserPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (isAuthenticated) return <AdvertiserDashboard />;
  return <AdvertiserLanding />;
}

function AdvertiserLanding() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const handleLogin = () => { openWalletLogin({ locale }); };

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950/20" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-[#FF3131] rounded-full text-sm font-medium mb-6">
              <Target className="w-4 h-4" />
              {t('home.forAdvertisers.title')}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.forAdvertisers.description')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">CPC & CPM - Banner, Native, Text</p>
            <button onClick={handleLogin} className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
              <LogIn className="w-5 h-5" />
              {t('nav.getStarted')}
            </button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Target, title: t('advertiser.landing.features.formats.title'), desc: t('advertiser.landing.features.formats.desc') },
            { icon: BarChart3, title: t('advertiser.landing.features.pricing.title'), desc: t('advertiser.landing.features.pricing.desc') },
            { icon: TrendingUp, title: t('advertiser.landing.features.analytics.title'), desc: t('advertiser.landing.features.analytics.desc') },
          ].map((f, i) => (
            <div key={i} className="card text-center hover-lift">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-6 h-6 text-[#FF3131]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-10">{t('home.howItWorks.title')}</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { step: '1', title: t('home.howItWorks.step1.title'), desc: t('advertiser.landing.steps.step1') },
              { step: '2', title: t('advertiser.landing.steps.step2'), desc: t('advertiser.landing.steps.step2desc') },
              { step: '3', title: t('advertiser.landing.steps.step3'), desc: t('advertiser.landing.steps.step3desc') },
              { step: '4', title: t('advertiser.landing.steps.step4'), desc: t('advertiser.landing.steps.step4desc') },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-full bg-[#FF3131] text-white font-bold flex items-center justify-center mx-auto mb-3">{s.step}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{s.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('advertiser.landing.ctaTitle')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{t('advertiser.landing.ctaDesc')}</p>
        <button onClick={handleLogin} className="btn-primary inline-flex items-center gap-2">
          <LogIn className="w-4 h-4" />
          {t('auth.loginWithWallet')}
        </button>
      </section>
    </div>
  );
}

function AdvertiserDashboard() {
  const t = useTranslations('advertiser');

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h1>
        <Link href="/advertiser/campaigns/create" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> {t('createCampaign')}
        </Link>
      </div>
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
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/advertiser/campaigns" className="card hover-lift flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-[#FF3131]" /></div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('campaigns')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('activeCampaigns', { count: 0 })}</p>
          </div>
        </Link>
        <Link href="/advertiser/billing" className="card hover-lift flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><CreditCard className="w-6 h-6 text-green-600" /></div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('billing')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('deposit')}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
