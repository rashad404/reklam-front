'use client';

import { useTranslations } from 'next-intl';
import { DollarSign, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export default function BillingPage() {
  const t = useTranslations('advertiser');

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{t('billing')}</h1>

      {/* Balance Card */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('balance')}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">0.00 AZN</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            {t('deposit')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3">
            <ArrowDownCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Deposited</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">0.00 AZN</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <ArrowUpCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalSpent')}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">0.00 AZN</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction History</h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No transactions yet
        </div>
      </div>
    </div>
  );
}
