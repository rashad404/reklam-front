'use client';

import { useTranslations } from 'next-intl';
import { DollarSign, ArrowUpCircle, Clock } from 'lucide-react';

export default function EarningsPage() {
  const t = useTranslations('publisher');

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{t('earnings')}</h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalEarned')}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">0.00 AZN</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('pendingEarnings')}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">0.00 AZN</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <ArrowUpCircle className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Withdrawn</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">0.00 AZN</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Earnings History</h2>
          <button className="btn-primary text-sm" disabled>
            {t('withdraw')} (min. 5 AZN)
          </button>
        </div>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No earnings yet
        </div>
      </div>
    </div>
  );
}
