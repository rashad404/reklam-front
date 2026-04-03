'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Copy, Check, Loader2, Code, CheckCircle } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthRequiredCard from '@/components/auth/AuthRequiredCard';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import apiClient from '@/lib/api/client';

export default function CreateAdUnitPage() {
  const t = useTranslations();
  const tp = useTranslations('publisher');
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [form, setForm] = useState({
    name: '',
    ad_format: 'banner_300x250',
    website_url: '',
    page_url: '',
  });

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <AuthRequiredCard />;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      // Auto-register as publisher if not already
      try {
        const userRes = await apiClient.get('/auth/user');
        const userName = userRes.data.data?.name || 'Publisher';
        await apiClient.post('/publisher/register', {
          website_url: form.website_url,
          website_name: userName,
        });
      } catch {
        // Already registered
      }

      const res = await apiClient.post('/ad-units', {
        name: form.name,
        ad_format: form.ad_format,
        website_url: form.website_url,
        page_url: form.page_url || null,
      });

      const unitId = res.data.data.id;
      const format = form.ad_format.replace('banner_', '');
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reklam.biz';
      setEmbedCode(
        `<div id="reklam-ad" data-unit="${unitId}" data-format="${format}"></div>\n<script async src="${siteUrl}/serve.js"></script>`
      );
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(embedCode);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = embedCode;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const inputClass = "w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-base";

  const formats = [
    { value: 'banner_728x90', label: tp('formatBanner728'), size: '728 x 90', preview: 'w-16 h-2' },
    { value: 'banner_300x250', label: tp('formatBanner300'), size: '300 x 250', preview: 'w-10 h-8' },
    { value: 'banner_320x50', label: tp('formatBanner320'), size: '320 x 50', preview: 'w-14 h-2' },
    { value: 'native', label: tp('formatNative'), size: '', preview: '' },
    { value: 'text', label: tp('formatText'), size: '', preview: '' },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/publisher/ad-units" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tp('createAdUnit')}</h1>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { num: 1, label: tp('stepInfo') },
          { num: 2, label: tp('stepCode') },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
              step > s.num ? 'bg-green-500 text-white' :
              step === s.num ? 'bg-green-600 text-white' :
              'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-sm ${step === s.num ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
              {s.label}
            </span>
            {i === 0 && <div className={`flex-1 h-0.5 ${step > 1 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Info */}
      {step === 1 && (
        <div className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tp('adUnitName')}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={tp('adUnitNamePlaceholder')}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tp('adFormat')}</label>
            <div className="space-y-2">
              {formats.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setForm({ ...form, ad_format: f.value })}
                  className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    form.ad_format === f.value
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
                  }`}
                >
                  {f.preview ? (
                    <div className={`${f.preview} bg-green-200 dark:bg-green-800 rounded shrink-0`} />
                  ) : (
                    <Code className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${form.ad_format === f.value ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                      {f.label}
                    </p>
                    {f.size && <p className="text-xs text-gray-500">{f.size} px</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tp('websiteUrl')}</label>
            <input
              type="url"
              value={form.website_url}
              onChange={(e) => setForm({ ...form, website_url: e.target.value })}
              placeholder={tp('websiteUrlPlaceholder')}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tp('pageUrl')}</label>
            <input
              type="url"
              value={form.page_url}
              onChange={(e) => setForm({ ...form, page_url: e.target.value })}
              placeholder={tp('pageUrlPlaceholder')}
              className={inputClass}
            />
            <p className="text-xs text-gray-500 mt-1">{tp('pageUrlHint')}</p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!form.name || !form.website_url || submitting}
            className="btn-primary w-full flex items-center justify-center gap-2 !bg-green-600 hover:!bg-green-700 disabled:opacity-50"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {tp('creating')}</>
            ) : (
              <>{t('common.create')} <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}

      {/* Step 2: Embed code */}
      {step === 2 && (
        <div className="card space-y-6">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{tp('created')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{tp('embedCodeDesc')}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{tp('embedCode')}</label>
              <button type="button" onClick={handleCopy} className="text-sm text-green-600 flex items-center gap-1 font-medium">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? tp('codeCopied') : tp('copyCode')}
              </button>
            </div>
            <pre className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 text-sm text-green-400 overflow-x-auto select-all">
              {embedCode}
            </pre>
          </div>

          <Link href="/publisher/ad-units" className="btn-primary w-full flex items-center justify-center gap-2 !bg-green-600 hover:!bg-green-700">
            {tp('goToAdUnits')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
