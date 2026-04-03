'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { Megaphone, Globe, TrendingUp, Users, Eye, DollarSign, ArrowRight, BarChart3, MousePointer, Zap } from 'lucide-react';
import { PLATFORM_CONFIG } from '@/lib/config';

export default function HomePage() {
  const t = useTranslations();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950/20" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              <span className="gradient-text">{t('home.hero.title')}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/advertiser" className="btn-primary flex items-center justify-center gap-2">
                <Megaphone className="w-5 h-5" />
                {t('home.forAdvertisers.cta')}
              </Link>
              <Link href="/publisher" className="btn-secondary flex items-center justify-center gap-2">
                <Globe className="w-5 h-5" />
                {t('home.forPublishers.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: '500+', label: t('home.stats.advertisers') },
              { icon: Globe, value: '1,200+', label: t('home.stats.publishers') },
              { icon: Eye, value: '50M+', label: t('home.stats.impressions') },
              { icon: DollarSign, value: '250K+', label: t('home.stats.revenue') },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="w-8 h-8 text-[#FF3131] mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Advertisers & Publishers */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Advertiser Card */}
          <div className="card hover-lift">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <Megaphone className="w-6 h-6 text-[#FF3131]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('home.forAdvertisers.title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('home.forAdvertisers.description')}
            </p>
            <ul className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#FF3131]" />
                {t('home.forAdvertisers.pricingTypes')}
              </li>
              <li className="flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-[#FF3131]" />
                {t('home.forAdvertisers.adFormats')}
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#FF3131]" />
                {t('home.forAdvertisers.analytics')}
              </li>
            </ul>
            <Link href="/advertiser" className="text-[#FF3131] font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
              {t('home.forAdvertisers.cta')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Publisher Card */}
          <div className="card hover-lift">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('home.forPublishers.title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('home.forPublishers.description')}
            </p>
            <ul className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                {t('home.forPublishers.revenueShare', { revenueShare: PLATFORM_CONFIG.publisherRevenueShare })}
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-600" />
                {t('home.forPublishers.easyEmbed')}
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                {t('home.forPublishers.earningsDashboard')}
              </li>
            </ul>
            <Link href="/publisher" className="text-green-600 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
              {t('home.forPublishers.cta')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {t('home.howItWorks.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: t('home.howItWorks.step1.title'), desc: t('home.howItWorks.step1.description') },
              { step: '2', title: t('home.howItWorks.step2.title'), desc: t('home.howItWorks.step2.description') },
              { step: '3', title: t('home.howItWorks.step3.title'), desc: t('home.howItWorks.step3.description') },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#FF3131] text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
