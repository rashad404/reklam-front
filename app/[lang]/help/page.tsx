'use client';

import { useTranslations } from 'next-intl';
import { HelpCircle, Megaphone, Globe, Mail } from 'lucide-react';
import { PLATFORM_CONFIG } from '@/lib/config';

export default function HelpPage() {
  const t = useTranslations('help');
  const cfg = PLATFORM_CONFIG;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <HelpCircle className="w-12 h-12 text-[#FF3131] mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
      </div>

      <div className="space-y-8">
        {/* Advertiser FAQ */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-5 h-5 text-[#FF3131]" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('advertiserTitle')}</h2>
          </div>
          <div className="space-y-4">
            {['Q1', 'Q2', 'Q3'].map(q => (
              <div key={q}>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t(`advertiser${q}`)}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t(`advertiser${q.replace('Q', 'A')}`, { minBudget: cfg.minBudget })}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Publisher FAQ */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('publisherTitle')}</h2>
          </div>
          <div className="space-y-4">
            {['Q1', 'Q2', 'Q3'].map(q => (
              <div key={q}>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t(`publisher${q}`)}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t(`publisher${q.replace('Q', 'A')}`, { revenueShare: cfg.publisherRevenueShare, minWithdrawal: cfg.minWithdrawal })}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="card text-center">
          <Mail className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('contactTitle')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{t('contactDesc')}</p>
          <a href="mailto:info@reklam.biz" className="text-[#FF3131] font-medium hover:underline">{t('email')}</a>
        </div>
      </div>
    </div>
  );
}
