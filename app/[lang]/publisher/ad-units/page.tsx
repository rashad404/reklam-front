'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { Plus, Eye, MousePointer, Copy, Check, Globe, Pause, Play } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthRequiredCard from '@/components/auth/AuthRequiredCard';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import apiClient from '@/lib/api/client';

interface AdUnit {
  id: number;
  name: string;
  ad_format: string;
  website_url: string;
  page_url: string | null;
  status: string;
  impressions_count: number;
  clicks_count: number;
  created_at: string;
}

export default function AdUnitsPage() {
  const t = useTranslations('publisher');
  const tc = useTranslations('common');
  const { isAuthenticated, isLoading } = useAuth();
  const [adUnits, setAdUnits] = useState<AdUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    apiClient.get('/ad-units')
      .then(res => setAdUnits(res.data.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <AuthRequiredCard />;

  const handleCopy = (unit: AdUnit) => {
    const format = unit.ad_format.replace('banner_', '');
    const code = `<div id="reklam-ad" data-unit="${unit.id}" data-format="${format}"></div>\n<script src="https://reklam.biz/serve.js"></script>`;
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedId(unit.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleStatus = async (id: number, status: 'active' | 'paused') => {
    try {
      await apiClient.put(`/ad-units/${id}`, { status });
      setAdUnits(prev => prev.map(u => u.id === id ? { ...u, status } : u));
    } catch {}
  };

  const formatLabels: Record<string, string> = {
    banner_728x90: t('formatBanner728'),
    banner_300x250: t('formatBanner300'),
    banner_320x50: t('formatBanner320'),
    native: t('formatNative'),
    text: t('formatText'),
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('adUnits')}</h1>
        <Link href="/publisher/ad-units/create" className="btn-primary flex items-center gap-2 text-sm !bg-green-600 hover:!bg-green-700">
          <Plus className="w-4 h-4" /> {t('createAdUnit')}
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : adUnits.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('noAdUnits')}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t('noAdUnitsDesc')}</p>
          <Link href="/publisher/ad-units/create" className="btn-primary inline-flex items-center gap-2 !bg-green-600 hover:!bg-green-700">
            <Plus className="w-4 h-4" /> {t('createAdUnit')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {adUnits.map((unit) => (
            <div key={unit.id} className="card">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{unit.name}</h3>
                  <p className="text-sm text-gray-500">{formatLabels[unit.ad_format] || unit.ad_format}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                  unit.status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {unit.status === 'active' ? tc('active') : tc('inactive')}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {unit.website_url.replace('https://', '').replace('http://', '')}</span>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {unit.impressions_count || 0}</span>
                <span className="flex items-center gap-1"><MousePointer className="w-3.5 h-3.5" /> {unit.clicks_count || 0}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(unit)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  {copiedId === unit.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === unit.id ? t('codeCopied') : t('copyCode')}
                </button>

                {unit.status === 'active' ? (
                  <button
                    onClick={() => handleStatus(unit.id, 'paused')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 transition-colors"
                  >
                    <Pause className="w-3.5 h-3.5" /> {tc('inactive')}
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatus(unit.id, 'active')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" /> {tc('active')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
