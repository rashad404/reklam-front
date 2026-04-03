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
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'display',
    pricing: 'cpc' as 'cpc' | 'cpm',
    budget: '',
    daily_budget: '',
    bid: '',
    start_date: '',
    end_date: '',
    ad_title: '',
    ad_description: '',
    ad_image_url: '',
    ad_destination_url: '',
  });

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <AuthRequiredCard />;

  const totalSteps = 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Auto-register as advertiser if not already (uses user's name)
      try {
        const userRes = await apiClient.get('/auth/user');
        const userName = userRes.data.data?.name || 'Advertiser';
        await apiClient.post('/advertiser/register', { company_name: userName });
      } catch {
        // Already registered, ignore
      }

      // 1. Create campaign
      const campaignRes = await apiClient.post('/campaigns', {
        name: form.name,
        type: form.type,
        budget: parseFloat(form.budget),
        daily_budget: form.daily_budget ? parseFloat(form.daily_budget) : null,
        cpc_bid: form.pricing === 'cpc' ? parseFloat(form.bid) : null,
        cpm_bid: form.pricing === 'cpm' ? parseFloat(form.bid) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      });

      const campaignId = campaignRes.data.data.id;

      // 2. Create ad creative
      const adTitle = form.ad_title || form.name;
      if (form.ad_destination_url) {
        await apiClient.post('/ads', {
          campaign_id: campaignId,
          title: adTitle,
          description: form.ad_description || null,
          image_url: form.ad_image_url || null,
          destination_url: form.ad_destination_url,
          ad_format: form.type === 'display' ? 'banner_300x250' : form.type,
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
    { num: 1, label: ta('stepDetails') },
    { num: 2, label: ta('stepBudget') },
    { num: 3, label: ta('stepAd') },
    { num: 4, label: ta('stepSchedule') },
  ];

  const inputClass = "w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF3131] focus:border-transparent text-base";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/advertiser/campaigns" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{ta('createCampaign')}</h1>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-1 mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-1 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              step > s.num ? 'bg-green-500 text-white' :
              step === s.num ? 'bg-[#FF3131] text-white' :
              'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
            </div>
            <span className={`text-xs hidden sm:block ${step === s.num ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${step > s.num ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic info */}
        {step === 1 && (
          <div className="card space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('campaignName')}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={ta('campaignNamePlaceholder')}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('campaignType')}</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'display', label: ta('formatDisplay') },
                  { value: 'native', label: ta('formatNative') },
                  { value: 'text', label: ta('formatText') },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, type: opt.value })}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      form.type === opt.value
                        ? 'border-[#FF3131] bg-red-50 dark:bg-red-900/20 text-[#FF3131]'
                        : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => form.name ? setStep(2) : null}
              disabled={!form.name}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {t('common.next')} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Budget & Pricing */}
        {step === 2 && (
          <div className="card space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('pricingModel')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, pricing: 'cpc' })}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    form.pricing === 'cpc'
                      ? 'border-[#FF3131] bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
                  }`}
                >
                  <MousePointer className={`w-5 h-5 mb-2 ${form.pricing === 'cpc' ? 'text-[#FF3131]' : 'text-gray-400'}`} />
                  <p className={`font-medium text-sm ${form.pricing === 'cpc' ? 'text-[#FF3131]' : 'text-gray-900 dark:text-white'}`}>
                    {ta('pricingCpc')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{ta('pricingCpcDesc')}</p>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, pricing: 'cpm' })}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    form.pricing === 'cpm'
                      ? 'border-[#FF3131] bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Eye className={`w-5 h-5 mb-2 ${form.pricing === 'cpm' ? 'text-[#FF3131]' : 'text-gray-400'}`} />
                  <p className={`font-medium text-sm ${form.pricing === 'cpm' ? 'text-[#FF3131]' : 'text-gray-900 dark:text-white'}`}>
                    {ta('pricingCpm')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{ta('pricingCpmDesc')}</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {form.pricing === 'cpc' ? ta('pricePerClick') : ta('pricePer1000Views')} (AZN)
              </label>
              <input type="number" step="0.01" min="0.01" value={form.bid}
                onChange={(e) => setForm({ ...form, bid: e.target.value })}
                placeholder="0.10" className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('budget')} (AZN)</label>
              <input type="number" step="1" min="1" value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                placeholder="100" className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('dailyBudget')} (AZN)</label>
              <input type="number" step="1" min="1" value={form.daily_budget}
                onChange={(e) => setForm({ ...form, daily_budget: e.target.value })}
                className={inputClass} />
              <p className="text-xs text-gray-500 mt-1">{ta('dailyBudgetHint')}</p>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> {t('common.back')}
              </button>
              <button type="button" onClick={() => form.bid && form.budget ? setStep(3) : null}
                disabled={!form.bid || !form.budget}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                {t('common.next')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Ad Creative */}
        {step === 3 && (
          <div className="card space-y-6">
            {/* Image upload - primary for display ads */}
            {form.type === 'display' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('adImage')}</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      const fd = new FormData();
                      fd.append('image', file);
                      const res = await apiClient.post('/upload/image', fd, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      });
                      setForm(prev => ({ ...prev, ad_image_url: res.data.data.url }));
                    } catch {
                      setError('Image upload failed');
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
                {form.ad_image_url ? (
                  <div className="relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.ad_image_url} alt="Preview" className="max-w-full h-auto" />
                    <button type="button"
                      onClick={() => { setForm(prev => ({ ...prev, ad_image_url: '' })); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center gap-2 hover:border-[#FF3131] transition-colors">
                    {uploading ? (
                      <><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /><span className="text-sm text-gray-500">{ta('adImageUploading')}</span></>
                    ) : (
                      <><Upload className="w-6 h-6 text-gray-400" /><span className="text-sm text-gray-500">{ta('adImageUpload')}</span></>
                    )}
                  </button>
                )}
                <p className="text-xs text-gray-500 mt-2">{ta('adImageHint')}</p>
              </div>
            )}

            {/* Title & description - required for text/native, optional for display */}
            {(form.type === 'text' || form.type === 'native') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('adTitle')}</label>
                  <input type="text" value={form.ad_title}
                    onChange={(e) => setForm({ ...form, ad_title: e.target.value })}
                    placeholder={ta('adTitlePlaceholder')} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('adDescription')}</label>
                  <textarea value={form.ad_description}
                    onChange={(e) => setForm({ ...form, ad_description: e.target.value })}
                    placeholder={ta('adDescriptionPlaceholder')} rows={3}
                    className={inputClass + ' resize-none'} />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('adDestination')}</label>
              <input type="url" value={form.ad_destination_url}
                onChange={(e) => setForm({ ...form, ad_destination_url: e.target.value })}
                placeholder={ta('adDestinationPlaceholder')} className={inputClass} />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> {t('common.back')}
              </button>
              <button type="button" onClick={() => {
                const canProceed = form.type === 'display'
                  ? form.ad_image_url && form.ad_destination_url
                  : form.ad_title && form.ad_destination_url;
                if (canProceed) setStep(4);
              }}
                disabled={form.type === 'display' ? !form.ad_image_url || !form.ad_destination_url : !form.ad_title || !form.ad_destination_url}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                {t('common.next')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Schedule + Summary */}
        {step === 4 && (
          <div className="card space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('startDate')}</label>
                <input type="date" value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{ta('endDate')}</label>
                <input type="date" value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className={inputClass} />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{ta('campaignName')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{form.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{ta('campaignType')}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {form.type === 'display' ? ta('formatDisplay') : form.type === 'native' ? ta('formatNative') : ta('formatText')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{ta('pricingModel')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{form.pricing === 'cpc' ? ta('pricingCpc') : ta('pricingCpm')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{form.pricing === 'cpc' ? ta('pricePerClick') : ta('pricePer1000Views')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{form.bid} AZN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{ta('budget')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{form.budget} AZN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{ta('adTitle')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{form.ad_title}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(3)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> {t('common.back')}
              </button>
              <button type="submit" disabled={submitting}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {ta('creating')}</> : <><Check className="w-4 h-4" /> {t('common.create')}</>}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
