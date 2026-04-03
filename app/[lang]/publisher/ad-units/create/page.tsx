'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthRequiredCard from '@/components/auth/AuthRequiredCard';
import LoadingSpinner from '@/components/auth/LoadingSpinner';

export default function CreateAdUnitPage() {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    name: '',
    ad_format: 'banner_300x250',
    website_url: '',
    page_url: '',
  });

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <AuthRequiredCard />;

  const embedCode = `<div id="reklam-ad" data-unit="UNIT_ID" data-format="${form.ad_format.replace('banner_', '')}"></div>\n<script src="https://reklam.biz/serve.js"></script>`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call
    router.push('/publisher/ad-units');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/publisher/ad-units" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('publisher.createAdUnit')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Homepage Sidebar"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF3131] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad Format</label>
          <select
            value={form.ad_format}
            onChange={(e) => setForm({ ...form, ad_format: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF3131] focus:border-transparent"
          >
            <option value="banner_728x90">Banner 728x90 (Leaderboard)</option>
            <option value="banner_300x250">Banner 300x250 (Medium Rectangle)</option>
            <option value="banner_320x50">Banner 320x50 (Mobile)</option>
            <option value="native">Native</option>
            <option value="text">Text</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website URL</label>
          <input
            type="url"
            value={form.website_url}
            onChange={(e) => setForm({ ...form, website_url: e.target.value })}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF3131] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page URL (optional)</label>
          <input
            type="url"
            value={form.page_url}
            onChange={(e) => setForm({ ...form, page_url: e.target.value })}
            placeholder="https://example.com/blog"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF3131] focus:border-transparent"
          />
        </div>

        {/* Embed Code Preview */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('publisher.embedCode')}</label>
            <button type="button" onClick={handleCopy} className="text-sm text-[#FF3131] flex items-center gap-1">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t('publisher.codeCopied') : t('publisher.copyCode')}
            </button>
          </div>
          <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
            {embedCode}
          </pre>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary flex-1">{t('common.create')}</button>
          <Link href="/publisher/ad-units" className="btn-secondary flex-1 text-center">{t('common.cancel')}</Link>
        </div>
      </form>
    </div>
  );
}
