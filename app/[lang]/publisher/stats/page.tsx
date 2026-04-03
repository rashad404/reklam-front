'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { ArrowLeft, Eye, MousePointer, TrendingUp, Globe, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthRequiredCard from '@/components/auth/AuthRequiredCard';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import apiClient from '@/lib/api/client';

interface DailyData { date: string; impressions: number; clicks: number; ctr: number }
interface BreakdownData { label: string; impressions: number; clicks: number; ctr: number }

export default function PublisherStatsPage() {
  const t = useTranslations();
  const tp = useTranslations('publisher');
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30');
  const [data, setData] = useState<any>(null);

  const fetchStats = (days: string) => {
    setLoading(true);
    const from = new Date(Date.now() - parseInt(days) * 86400000).toISOString().split('T')[0];
    const to = new Date().toISOString().split('T')[0];
    apiClient.get(`/stats/publisher?from=${from}&to=${to}`)
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAuthenticated) fetchStats(range);
  }, [isAuthenticated]);

  if (authLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <AuthRequiredCard />;

  const handleRangeChange = (days: string) => {
    setRange(days);
    fetchStats(days);
  };

  const deviceIcons: Record<string, any> = { desktop: Monitor, mobile: Smartphone, tablet: Tablet };
  const maxImpressions = data?.daily ? Math.max(...data.daily.map((d: DailyData) => d.impressions), 1) : 1;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/publisher" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('common.realTimeAnalytics')}</h1>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[['7', '7 gun'], ['30', '30 gun'], ['90', '90 gun']].map(([val, label]) => (
            <button key={val} onClick={() => handleRangeChange(val)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                range === val ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : data && (
        <div className="space-y-6">
          {/* Totals */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Eye, label: t('advertiser.impressions'), value: data.totals.impressions.toLocaleString(), color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
              { icon: MousePointer, label: t('advertiser.clicks'), value: data.totals.clicks.toLocaleString(), color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
              { icon: TrendingUp, label: 'CTR', value: `${data.totals.ctr}%`, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
            ].map((stat, i) => (
              <div key={i} className="card">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Daily Chart */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('advertiser.impressions')} / {t('advertiser.clicks')}</h2>
            <div className="flex items-end gap-[2px] h-40">
              {data.daily.map((d: DailyData, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-[1px] group relative">
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    {d.date}: {d.impressions} imp, {d.clicks} clicks
                  </div>
                  <div className="w-full bg-green-200 dark:bg-green-900/50 rounded-t-sm"
                    style={{ height: `${Math.max((d.impressions / maxImpressions) * 100, 2)}%` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-gray-400">
              <span>{data.from}</span>
              <span>{data.to}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* By Device */}
            <div className="card">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Device</h2>
              <div className="space-y-3">
                {(data.by_device as BreakdownData[]).map((d, i) => {
                  const Icon = deviceIcons[d.label] || Monitor;
                  const maxImp = Math.max(...data.by_device.map((x: BreakdownData) => x.impressions), 1);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 dark:text-gray-300 capitalize">{d.label}</span>
                          <span className="text-gray-500">{d.impressions} / {d.clicks}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${(d.impressions / maxImp) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {data.by_device.length === 0 && <p className="text-sm text-gray-400">-</p>}
              </div>
            </div>

            {/* By Country */}
            <div className="card">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Country</h2>
              <div className="space-y-3">
                {(data.by_country as BreakdownData[]).map((d, i) => {
                  const maxImp = Math.max(...data.by_country.map((x: BreakdownData) => x.impressions), 1);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 dark:text-gray-300">{d.label || 'Unknown'}</span>
                          <span className="text-gray-500">{d.impressions} / {d.clicks}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(d.impressions / maxImp) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {data.by_country.length === 0 && <p className="text-sm text-gray-400">-</p>}
              </div>
            </div>
          </div>

          {/* By Ad Unit */}
          {data.by_ad_unit && data.by_ad_unit.length > 0 && (
            <div className="card">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{tp('adUnits')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-2 font-medium">{tp('adUnitName')}</th>
                      <th className="pb-2 font-medium text-right">{t('advertiser.impressions')}</th>
                      <th className="pb-2 font-medium text-right">{t('advertiser.clicks')}</th>
                      <th className="pb-2 font-medium text-right">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.by_ad_unit.map((u: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 text-gray-900 dark:text-white">{u.name}</td>
                        <td className="py-2 text-right text-gray-600 dark:text-gray-400">{u.impressions}</td>
                        <td className="py-2 text-right text-gray-600 dark:text-gray-400">{u.clicks}</td>
                        <td className="py-2 text-right text-gray-600 dark:text-gray-400">{u.ctr}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
