'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Check, Upload, X } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthRequiredCard from '@/components/auth/AuthRequiredCard';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import apiClient from '@/lib/api/client';

export default function EditCampaignPage() {
  const t = useTranslations();
  const ta = useTranslations('advertiser');
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [campaign, setCampaign] = useState<any>(null);
  const [ad, setAd] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    budget: '',
    daily_budget: '',
    cpc_bid: '',
    cpm_bid: '',
    start_date: '',
    end_date: '',
    ad_title: '',
    ad_description: '',
    ad_image_url: '',
    ad_destination_url: '',
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    const id = params.id;

    Promise.all([
      apiClient.get(`/campaigns/${id}`),
      apiClient.get('/ads'),
    ]).then(([campRes, adsRes]) => {
      const c = campRes.data.data;
      const ads = (adsRes.data.data?.data || []).filter((a: any) => a.campaign_id === Number(id));
      const firstAd = ads[0] || null;

      setCampaign(c);
      setAd(firstAd);
      setForm({
        name: c.name || '',
        budget: c.budget || '',
        daily_budget: c.daily_budget || '',
        cpc_bid: c.cpc_bid || '',
        cpm_bid: c.cpm_bid || '',
        start_date: c.start_date || '',
        end_date: c.end_date || '',
        ad_title: firstAd?.title || '',
        ad_description: firstAd?.description || '',
        ad_image_url: firstAd?.image_url || '',
        ad_destination_url: firstAd?.destination_url || '',
      });
    }).catch(() => {
      setError('Campaign not found');
    }).finally(() => setLoading(false));
  }, [isAuthenticated, params.id]);

  if (authLoading || loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <AuthRequiredCard />;
  if (!campaign) return <div className="container mx-auto px-4 py-8 text-center text-gray-500">{error}</div>;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.put(`/campaigns/${campaign.id}`, {
        name: form.name,
        budget: parseFloat(form.budget),
        daily_budget: form.daily_budget ? parseFloat(form.daily_budget) : null,
        cpc_bid: form.cpc_bid ? parseFloat(form.cpc_bid) : null,
        cpm_bid: form.cpm_bid ? parseFloat(form.cpm_bid) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      });

      if (ad) {
        await apiClient.put(`/ads/${ad.id}`, {
          title: form.ad_title || form.name,
          description: form.ad_description || null,
          image_url: form.ad_image_url || null,
          destination_url: form.ad_destination_url,
        });
      }

      setSuccess(ta('created'));
      setTimeout(() => router.push('/advertiser/campaigns'), 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF3131] focus:border-transparent text-base";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/advertiser/campaigns" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{ta('editCampaign')} - {campaign.name}</h1>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 text-sm">{success}</div>}

      <div className="space-y-6">
        {/* Campaign details */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">{ta('stepDetails')}</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('campaignName')}</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('budget')} (AZN)</label>
              <input type="number" step="1" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('dailyBudget')} (AZN)</label>
              <input type="number" step="1" value={form.daily_budget} onChange={(e) => setForm({ ...form, daily_budget: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('pricePerClick')} (AZN)</label>
              <input type="number" step="0.01" value={form.cpc_bid} onChange={(e) => setForm({ ...form, cpc_bid: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('pricePer1000Views')} (AZN)</label>
              <input type="number" step="0.01" value={form.cpm_bid} onChange={(e) => setForm({ ...form, cpm_bid: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('startDate')}</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('endDate')}</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Ad creative */}
        {ad && (
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">{ta('stepAd')}</h2>

            {ad.ad_format?.startsWith('banner') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('adImage')}</label>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      const fd = new FormData();
                      fd.append('image', file);
                      const res = await apiClient.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                      setForm(prev => ({ ...prev, ad_image_url: res.data.data.url }));
                    } catch { setError('Upload failed'); }
                    finally { setUploading(false); }
                  }}
                />
                {form.ad_image_url ? (
                  <div className="relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.ad_image_url} alt="Preview" className="max-w-full h-auto" />
                    <button type="button" onClick={() => { setForm(prev => ({ ...prev, ad_image_url: '' })); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center gap-2 hover:border-[#FF3131] transition-colors">
                    {uploading ? <><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /><span className="text-sm text-gray-500">{ta('adImageUploading')}</span></>
                      : <><Upload className="w-6 h-6 text-gray-400" /><span className="text-sm text-gray-500">{ta('adImageUpload')}</span></>}
                  </button>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('adTitle')}</label>
              <input type="text" value={form.ad_title} onChange={(e) => setForm({ ...form, ad_title: e.target.value })} className={inputClass} />
              {ad.ad_format?.startsWith('banner') && (
                <p className="text-xs text-gray-500 mt-1">{ta('adTitleHint')}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('adDescription')}</label>
              <textarea value={form.ad_description} onChange={(e) => setForm({ ...form, ad_description: e.target.value })} rows={3} className={inputClass + ' resize-none'} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('adDestination')}</label>
              <input type="url" value={form.ad_destination_url} onChange={(e) => setForm({ ...form, ad_destination_url: e.target.value })} className={inputClass} />
            </div>
          </div>
        )}

        {/* Save */}
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /></> : <><Check className="w-4 h-4" /> {t('common.save')}</>}
          </button>
          <Link href="/advertiser/campaigns" className="btn-secondary flex-1 text-center">{t('common.cancel')}</Link>
        </div>
      </div>
    </div>
  );
}
