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

interface AdRecord { id: number; ad_format: string; title: string; description: string | null; image_url: string | null; destination_url: string; campaign_id: number }

export default function EditCampaignPage() {
  const t = useTranslations();
  const ta = useTranslations('advertiser');
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const fileRefs = {
    '300x250': useRef<HTMLInputElement>(null),
    '728x90': useRef<HTMLInputElement>(null),
    '320x50': useRef<HTMLInputElement>(null),
  };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSize, setUploadingSize] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [campaign, setCampaign] = useState<any>(null);
  const [ads, setAds] = useState<AdRecord[]>([]);
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
    ad_destination_url: '',
    images: { '300x250': '', '728x90': '', '320x50': '' } as Record<string, string>,
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    const id = params.id;

    Promise.all([
      apiClient.get(`/campaigns/${id}`),
      apiClient.get('/ads'),
    ]).then(([campRes, adsRes]) => {
      const c = campRes.data.data;
      const campaignAds: AdRecord[] = (adsRes.data.data?.data || []).filter((a: any) => a.campaign_id === Number(id));

      setCampaign(c);
      setAds(campaignAds);

      // Build images map from existing ads
      const images: Record<string, string> = { '300x250': '', '728x90': '', '320x50': '' };
      campaignAds.forEach((a: AdRecord) => {
        const size = a.ad_format.replace('banner_', '');
        if (images.hasOwnProperty(size)) {
          images[size] = a.image_url || '';
        }
      });

      // Get title/description/destination from first ad
      const firstAd = campaignAds[0];

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
        ad_destination_url: firstAd?.destination_url || '',
        images,
      });
    }).catch(() => {
      setError('Campaign not found');
    }).finally(() => setLoading(false));
  }, [isAuthenticated, params.id]);

  if (authLoading || loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <AuthRequiredCard />;
  if (!campaign) return <div className="container mx-auto px-4 py-8 text-center text-gray-500">{error}</div>;

  const handleUpload = async (size: string, file: File) => {
    setUploadingSize(size);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await apiClient.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(prev => ({ ...prev, images: { ...prev.images, [size]: res.data.data.url } }));
    } catch { setError('Upload failed'); }
    finally { setUploadingSize(''); }
  };

  const isDisplay = campaign.type === 'display';
  const adSizes = [
    { key: '300x250', label: ta('adSize300') },
    { key: '728x90', label: ta('adSize728') },
    { key: '320x50', label: ta('adSize320') },
  ];

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Update campaign
      await apiClient.put(`/campaigns/${campaign.id}`, {
        name: form.name,
        budget: parseFloat(form.budget),
        daily_budget: form.daily_budget ? parseFloat(form.daily_budget) : null,
        cpc_bid: form.cpc_bid ? parseFloat(form.cpc_bid) : null,
        cpm_bid: form.cpm_bid ? parseFloat(form.cpm_bid) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      });

      const adTitle = form.ad_title || form.name;

      if (isDisplay) {
        // Update or create ads per size
        for (const { key } of adSizes) {
          const format = `banner_${key}`;
          const existingAd = ads.find(a => a.ad_format === format);
          const imageUrl = form.images[key];

          if (imageUrl && existingAd) {
            // Update existing
            await apiClient.put(`/ads/${existingAd.id}`, {
              title: adTitle,
              description: form.ad_description || null,
              image_url: imageUrl,
              destination_url: form.ad_destination_url,
            });
          } else if (imageUrl && !existingAd) {
            // Create new
            await apiClient.post('/ads', {
              campaign_id: campaign.id,
              title: adTitle,
              description: form.ad_description || null,
              image_url: imageUrl,
              destination_url: form.ad_destination_url,
              ad_format: format,
            });
          }
          // If no image and existing ad, leave it (don't delete)
        }
      } else {
        // Text/native - update first ad
        const firstAd = ads[0];
        if (firstAd) {
          await apiClient.put(`/ads/${firstAd.id}`, {
            title: adTitle,
            description: form.ad_description || null,
            destination_url: form.ad_destination_url,
          });
        }
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
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">{ta('stepAd')}</h2>

          {/* Multi-size images for display ads */}
          {isDisplay && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('adImage')}</label>
              <p className="text-xs text-gray-500 mb-3">{ta('adImageHint')}</p>
              <div className="space-y-3">
                {adSizes.map(({ key, label }) => (
                  <div key={key}>
                    <input ref={fileRefs[key as keyof typeof fileRefs]} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(key, f); }} />
                    {form.images[key] ? (
                      <div className="relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-[10px] font-medium rounded">{label}</div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.images[key]} alt={label} className="w-full h-auto" />
                        <button type="button"
                          onClick={() => { setForm(prev => ({ ...prev, images: { ...prev.images, [key]: '' } })); const ref = fileRefs[key as keyof typeof fileRefs]; if (ref.current) ref.current.value = ''; }}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button type="button"
                        onClick={() => fileRefs[key as keyof typeof fileRefs].current?.click()}
                        disabled={uploadingSize === key}
                        className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center gap-3 hover:border-[#FF3131] transition-colors">
                        {uploadingSize === key ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin" /> : <Upload className="w-4 h-4 text-gray-400" />}
                        <span className="text-sm text-gray-500">{label}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('adTitle')}</label>
            <input type="text" value={form.ad_title} onChange={(e) => setForm({ ...form, ad_title: e.target.value })} className={inputClass} />
            {isDisplay && <p className="text-xs text-gray-500 mt-1">{ta('adTitleHint')}</p>}
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

        {/* Save */}
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> {t('common.save')}</>}
          </button>
          <Link href="/advertiser/campaigns" className="btn-secondary flex-1 text-center">{t('common.cancel')}</Link>
        </div>
      </div>
    </div>
  );
}
