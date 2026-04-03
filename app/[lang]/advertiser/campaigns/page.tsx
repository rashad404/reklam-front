'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { Plus, Eye, MousePointer, Play, Pause, DollarSign, Image as ImageIcon, Pencil } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthRequiredCard from '@/components/auth/AuthRequiredCard';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import apiClient from '@/lib/api/client';

interface Ad {
  id: number;
  campaign_id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  destination_url: string;
  ad_format: string;
  status: string;
}

interface Campaign {
  id: number;
  name: string;
  type: string;
  status: string;
  budget: string;
  spent: string;
  cpc_bid: string | null;
  cpm_bid: string | null;
  impressions_count: number;
  clicks_count: number;
  ads_count: number;
  ads?: Ad[];
  created_at: string;
}

export default function CampaignsPage() {
  const t = useTranslations('advertiser');
  const tc = useTranslations('common');
  const { user, isAuthenticated, isLoading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    Promise.all([
      apiClient.get('/campaigns').catch(() => ({ data: { data: { data: [] } } })),
      apiClient.get('/advertiser/dashboard').catch(() => ({ data: { data: { balance: 0 } } })),
      apiClient.get('/ads').catch(() => ({ data: { data: { data: [] } } })),
    ]).then(([campRes, dashRes, adsRes]) => {
      const campList = campRes.data.data?.data || [];
      const allAds: Ad[] = (adsRes.data.data?.data || []).map((a: any) => ({ ...a }));
      setBalance(parseFloat(dashRes.data.data?.balance || '0'));
      setCampaigns(campList.map((c: any) => ({
        ...c,
        ads: allAds.filter((a: any) => a.campaign_id === c.id),
      })));
    }).finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <AuthRequiredCard />;

  const handleStatusChange = async (campaignId: number, newStatus: 'active' | 'paused') => {
    if (newStatus === 'active' && balance <= 0) return;
    try {
      await apiClient.patch(`/campaigns/${campaignId}/status`, { status: newStatus });
      setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: newStatus } : c));
    } catch {}
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('campaigns')}</h1>
        <Link href="/advertiser/campaigns/create" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> {t('createCampaign')}
        </Link>
      </div>

      {/* Balance warning */}
      {balance <= 0 && campaigns.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 text-sm">
            <DollarSign className="w-4 h-4" />
            {t('balance')}: {balance.toFixed(2)} AZN - {t('lowBalance')}
          </div>
          <Link href="/advertiser/billing" className="text-sm font-medium text-[#FF3131] hover:underline">
            {t('deposit')}
          </Link>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : campaigns.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('noCampaigns')}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t('noCampaignsDesc')}</p>
          <Link href="/advertiser/campaigns/create" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> {t('createCampaign')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => {
            const ad = c.ads?.[0];
            const ctr = c.impressions_count > 0 ? ((c.clicks_count / c.impressions_count) * 100).toFixed(2) : '0';

            return (
              <div key={c.id} className="card">
                <div className="flex gap-4">
                  {/* Ad image preview */}
                  {ad?.image_url ? (
                    <div className="w-24 h-24 sm:w-32 sm:h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-20 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                  )}

                  {/* Campaign info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{c.name}</h3>
                        {ad && (
                          <p className="text-sm text-gray-500 truncate">{ad.title}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${statusColors[c.status] || statusColors.draft}`}>
                        {t(`status.${c.status}` as any)}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {c.impressions_count || 0}</span>
                      <span className="flex items-center gap-1"><MousePointer className="w-3.5 h-3.5" /> {c.clicks_count || 0}</span>
                      <span>CTR: {ctr}%</span>
                      <span>{c.spent || '0.00'} / {c.budget} AZN</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {(c.status === 'draft' || c.status === 'paused') && (
                        <button
                          onClick={() => handleStatusChange(c.id, 'active')}
                          disabled={balance <= 0}
                          title={balance <= 0 ? t('deposit') : ''}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            balance <= 0
                              ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 cursor-not-allowed'
                              : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5" /> {t('startCampaign')}
                        </button>
                      )}
                      {c.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(c.id, 'paused')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 transition-colors"
                        >
                          <Pause className="w-3.5 h-3.5" /> {t('pauseCampaign')}
                        </button>
                      )}
                      <Link
                        href={`/advertiser/campaigns/${c.id}/edit`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" /> {t('editCampaign')}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
