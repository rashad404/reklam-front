'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, MousePointer, Eye, Check, Upload, Loader2, X } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthRequiredCard from '@/components/auth/AuthRequiredCard';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import apiClient from '@/lib/api/client';

export default function CreateCampaignPage() {
  const t = useTranslations();
  const ta = useTranslations('advertiser');
  const tc = useTranslations('common');
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingSize, setUploadingSize] = useState('');
  const [error, setError] = useState('');
  const [previewTab, setPreviewTab] = useState('');
  const fileRefs = {
    '300x250': useRef<HTMLInputElement>(null),
    '728x90': useRef<HTMLInputElement>(null),
    '320x50': useRef<HTMLInputElement>(null),
  };
  const [form, setForm] = useState({
    pricing: 'cpc' as 'cpc' | 'cpm',
    budget: '',
    daily_budget: '',
    bid: '',
    start_date: '',
    end_date: '',
    ad_title: '',
    ad_description: '',
    ad_destination_url: '',
    images: { '300x250': '', '728x90': '', '320x50': '' } as Record<string, string>,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <AuthRequiredCard />;

  const handleUpload = async (size: string, file: File) => {
    setUploadingSize(size);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await apiClient.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(prev => ({ ...prev, images: { ...prev.images, [size]: res.data.data.url } }));
      setPreviewTab(size);
    } catch {
      setError('Image upload failed');
    } finally {
      setUploadingSize('');
    }
  };

  const hasAnyImage = Object.values(form.images).some(v => v);
  const hasText = form.ad_title.trim().length > 0;
  const hasContent = hasAnyImage || hasText;
  const uploadedSizes = Object.entries(form.images).filter(([, v]) => v);

  // Auto-generate campaign name
  const getCampaignName = () => {
    if (form.ad_title) return form.ad_title;
    if (form.ad_destination_url) {
      try {
        return new URL(form.ad_destination_url).hostname.replace('www.', '');
      } catch {}
    }
    return 'Campaign';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      try {
        const userRes = await apiClient.get('/auth/user');
        await apiClient.post('/advertiser/register', { company_name: userRes.data.data?.name || 'Advertiser' });
      } catch {}

      const campaignRes = await apiClient.post('/campaigns', {
        name: getCampaignName(),
        type: hasAnyImage ? 'display' : 'text',
        budget: parseFloat(form.budget),
        daily_budget: form.daily_budget ? parseFloat(form.daily_budget) : null,
        cpc_bid: form.pricing === 'cpc' ? parseFloat(form.bid) : null,
        cpm_bid: form.pricing === 'cpm' ? parseFloat(form.bid) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      });

      const campaignId = campaignRes.data.data.id;
      const adTitle = form.ad_title || getCampaignName();

      for (const [size, imageUrl] of Object.entries(form.images)) {
        if (imageUrl) {
          await apiClient.post('/ads', {
            campaign_id: campaignId, title: adTitle,
            description: form.ad_description || null, image_url: imageUrl,
            destination_url: form.ad_destination_url, ad_format: `banner_${size}`,
          });
        }
      }

      if (hasText) {
        await apiClient.post('/ads', {
          campaign_id: campaignId, title: adTitle,
          description: form.ad_description || null, image_url: null,
          destination_url: form.ad_destination_url, ad_format: 'text',
        });
      }

      router.push('/advertiser/campaigns');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: ta('stepAd') },
    { num: 2, label: ta('stepBudget') },
    { num: 3, label: ta('stepSchedule') },
  ];

  const inputClass = "w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF3131] focus:border-transparent text-base";

  const adSizes = [
    { key: '300x250', label: ta('adSize300') },
    { key: '728x90', label: ta('adSize728') },
    { key: '320x50', label: ta('adSize320') },
  ];

  // Active preview image
  const activePreviewSize = previewTab && form.images[previewTab] ? previewTab : uploadedSizes[0]?.[0] || '';
  const activePreviewImage = activePreviewSize ? form.images[activePreviewSize] : '';

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/advertiser/campaigns" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{ta('createCampaign')}</h1>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-1 mb-8 max-w-md">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-1 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              step > s.num ? 'bg-green-500 text-white' : step === s.num ? 'bg-[#FF3131] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
            </div>
            <span className={`text-xs hidden sm:block ${step === s.num ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>{s.label}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${step > s.num ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 text-sm">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Ad Creative + Preview */}
        {step === 1 && (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 card space-y-5">
              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('adImage')}</label>
                <p className="text-xs text-gray-500 mb-3">{ta('adImageHint')}</p>
                <div className="space-y-2">
                  {adSizes.map(({ key, label }) => (
                    <div key={key}>
                      <input ref={fileRefs[key as keyof typeof fileRefs]} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(key, f); }} />
                      {form.images[key] ? (
                        <div className="flex items-center gap-3 p-2 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-xl">
                          <div className="w-16 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={form.images[key]} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-sm text-green-700 dark:text-green-400 font-medium flex-1">{label}</span>
                          <button type="button"
                            onClick={() => { setForm(prev => ({ ...prev, images: { ...prev.images, [key]: '' } })); const ref = fileRefs[key as keyof typeof fileRefs]; if (ref.current) ref.current.value = ''; }}
                            className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 shrink-0">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => fileRefs[key as keyof typeof fileRefs].current?.click()} disabled={uploadingSize === key}
                          className="w-full py-3 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center gap-2 hover:border-[#FF3131] transition-colors">
                          {uploadingSize === key ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin" /> : <Upload className="w-4 h-4 text-gray-400" />}
                          <span className="text-sm text-gray-500">{label}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('adTitle')}</label>
                <input type="text" value={form.ad_title} onChange={(e) => setForm({ ...form, ad_title: e.target.value })}
                  placeholder={ta('adTitlePlaceholder')} className={inputClass} />
                {!hasAnyImage && !hasText && <p className="text-xs text-[#FF3131] mt-1">*</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('adDescription')}</label>
                <textarea value={form.ad_description} onChange={(e) => setForm({ ...form, ad_description: e.target.value })}
                  placeholder={ta('adDescriptionPlaceholder')} rows={2} className={inputClass + ' resize-none'} />
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('adDestination')}</label>
                <input type="url" value={form.ad_destination_url} onChange={(e) => setForm({ ...form, ad_destination_url: e.target.value })}
                  placeholder={ta('adDestinationPlaceholder')} className={inputClass} />
              </div>

              <button type="button" onClick={() => hasContent && form.ad_destination_url ? setStep(2) : null}
                disabled={!hasContent || !form.ad_destination_url}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {t('common.next')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Preview */}
            <div className="lg:col-span-2 hidden lg:block">
              <div className="sticky top-20">
                <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">{tc('preview')}</p>

                {/* Preview tabs if multiple images */}
                {(uploadedSizes.length > 1 || (uploadedSizes.length >= 1 && hasText)) && (
                  <div className="flex gap-1 mb-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    {uploadedSizes.map(([size]) => {
                      const sizeLabel = adSizes.find(s => s.key === size)?.label || size;
                      return (
                        <button key={size} type="button" onClick={() => setPreviewTab(size)}
                          className={`flex-1 px-2 py-1 text-[10px] font-medium rounded-md transition-colors ${
                            activePreviewSize === size && previewTab !== 'text' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'
                          }`}>
                          {sizeLabel}
                        </button>
                      );
                    })}
                    {hasText && (
                      <button type="button" onClick={() => setPreviewTab('text')}
                        className={`flex-1 px-2 py-1 text-[10px] font-medium rounded-md transition-colors ${
                          previewTab === 'text' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'
                        }`}>
                        {ta('formatText')}
                      </button>
                    )}
                  </div>
                )}

                {/* Preview content */}
                {previewTab === 'text' || (!hasAnyImage && hasText) ? (
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-3 border border-gray-100 dark:border-gray-800">
                    <div className="font-bold text-sm text-gray-900 dark:text-white mb-1">{form.ad_title || '...'}</div>
                    {form.ad_description && <div className="text-xs text-gray-500">{form.ad_description}</div>}
                  </div>
                ) : activePreviewImage ? (
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-800">
                    <div style={{ aspectRatio: activePreviewSize === '728x90' ? '728/90' : activePreviewSize === '320x50' ? '320/50' : '300/250' }} className="overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={activePreviewImage} alt="" className="w-full h-full object-cover" />
                    </div>
                    {(form.ad_title || form.ad_description) && (
                      <div className="p-3">
                        {form.ad_title && <div className="font-bold text-sm text-gray-900 dark:text-white mb-1">{form.ad_title}</div>}
                        {form.ad_description && <div className="text-xs text-gray-500">{form.ad_description}</div>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center text-gray-400 text-sm">
                    {ta('adImageUpload')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Budget */}
        {step === 2 && (
          <div className="max-w-xl">
            <div className="card space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('pricingModel')}</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: 'cpc', icon: MousePointer, label: ta('pricingCpc'), desc: ta('pricingCpcDesc') },
                    { val: 'cpm', icon: Eye, label: ta('pricingCpm'), desc: ta('pricingCpmDesc') },
                  ].map((opt) => (
                    <button key={opt.val} type="button" onClick={() => setForm({ ...form, pricing: opt.val as 'cpc' | 'cpm' })}
                      className={`p-4 rounded-xl border text-left transition-all ${form.pricing === opt.val ? 'border-[#FF3131] bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'}`}>
                      <opt.icon className={`w-5 h-5 mb-2 ${form.pricing === opt.val ? 'text-[#FF3131]' : 'text-gray-400'}`} />
                      <p className={`font-medium text-sm ${form.pricing === opt.val ? 'text-[#FF3131]' : 'text-gray-900 dark:text-white'}`}>{opt.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{form.pricing === 'cpc' ? ta('pricePerClick') : ta('pricePer1000Views')} (AZN)</label>
                <input type="number" step="0.01" min="0.01" value={form.bid} onChange={(e) => setForm({ ...form, bid: e.target.value })} placeholder="0.10" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('budget')} (AZN)</label>
                <input type="number" step="1" min="1" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="100" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('dailyBudget')} (AZN)</label>
                <input type="number" step="1" min="1" value={form.daily_budget} onChange={(e) => setForm({ ...form, daily_budget: e.target.value })} className={inputClass} />
                <p className="text-xs text-gray-500 mt-1">{ta('dailyBudgetHint')}</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 flex items-center justify-center gap-2"><ArrowLeft className="w-4 h-4" /> {t('common.back')}</button>
                <button type="button" onClick={() => form.bid && form.budget ? setStep(3) : null} disabled={!form.bid || !form.budget}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">{t('common.next')} <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Schedule + Summary */}
        {step === 3 && (
          <div className="max-w-xl">
            <div className="card space-y-6">
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
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2 text-sm">
                {form.ad_title && <div className="flex justify-between"><span className="text-gray-500">{ta('adTitle')}</span><span className="font-medium text-gray-900 dark:text-white">{form.ad_title}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">{ta('pricingModel')}</span><span className="font-medium text-gray-900 dark:text-white">{form.pricing === 'cpc' ? ta('pricingCpc') : ta('pricingCpm')}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{form.pricing === 'cpc' ? ta('pricePerClick') : ta('pricePer1000Views')}</span><span className="font-medium text-gray-900 dark:text-white">{form.bid} AZN</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{ta('budget')}</span><span className="font-medium text-gray-900 dark:text-white">{form.budget} AZN</span></div>
                {hasAnyImage && <div className="flex justify-between"><span className="text-gray-500">{ta('adImage')}</span><span className="font-medium text-gray-900 dark:text-white">{uploadedSizes.map(([k]) => k).join(', ')}</span></div>}
                {hasText && <div className="flex justify-between"><span className="text-gray-500">{ta('formatText')}</span><span className="font-medium text-green-600">+</span></div>}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 flex items-center justify-center gap-2"><ArrowLeft className="w-4 h-4" /> {t('common.back')}</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {ta('creating')}</> : <><Check className="w-4 h-4" /> {t('common.create')}</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
