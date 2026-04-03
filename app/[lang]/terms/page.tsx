'use client';

import { useTranslations } from 'next-intl';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  const t = useTranslations('terms');

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <FileText className="w-12 h-12 text-[#FF3131] mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
      </div>

      <div className="card space-y-6">
        <p className="text-gray-600 dark:text-gray-400">{t('intro')}</p>

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('generalTitle')}</h2>
          <ul className="space-y-2">
            {['general1', 'general2', 'general3'].map(k => (
              <li key={k} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-[#FF3131] shrink-0">-</span>
                {t(k)}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('advertiserTitle')}</h2>
          <ul className="space-y-2">
            {['advertiser1', 'advertiser2', 'advertiser3'].map(k => (
              <li key={k} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-[#FF3131] shrink-0">-</span>
                {t(k)}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('publisherTitle')}</h2>
          <ul className="space-y-2">
            {['publisher1', 'publisher2', 'publisher3', 'publisher4'].map(k => (
              <li key={k} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-[#FF3131] shrink-0">-</span>
                {t(k)}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-[#FF3131] mb-3">{t('fraudTitle')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('fraudDesc')}</p>
        </div>

        <p className="text-sm text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-800">{t('contact')}</p>
      </div>
    </div>
  );
}
