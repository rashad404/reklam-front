'use client';

import { useTranslations } from 'next-intl';

export default function AdminAdsPage() {
  const t = useTranslations('admin');

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('ads')}</h1>

      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <button className="text-sm font-medium text-[#FF3131] border-b-2 border-[#FF3131] pb-1">{t('pending')}</button>
          <button className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 pb-1">{t('approved')}</button>
          <button className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 pb-1">{t('rejected')}</button>
        </div>

        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No pending ads
        </div>
      </div>
    </div>
  );
}
