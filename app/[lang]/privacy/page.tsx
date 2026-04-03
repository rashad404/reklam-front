'use client';

import { useTranslations } from 'next-intl';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  const t = useTranslations('privacy');

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <Shield className="w-12 h-12 text-[#FF3131] mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
      </div>

      <div className="card space-y-6">
        <p className="text-gray-600 dark:text-gray-400">{t('intro')}</p>

        {[
          { title: t('dataCollection'), desc: t('dataCollectionDesc') },
          { title: t('dataUsage'), desc: t('dataUsageDesc') },
          { title: t('cookies'), desc: t('cookiesDesc') },
          { title: t('thirdParty'), desc: t('thirdPartyDesc') },
        ].map((section, i) => (
          <div key={i}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{section.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{section.desc}</p>
          </div>
        ))}

        <p className="text-sm text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-800">{t('contact')}</p>
      </div>
    </div>
  );
}
