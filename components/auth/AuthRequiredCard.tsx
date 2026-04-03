'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { openWalletLogin, getLocaleFromPathname } from '@/lib/utils/walletAuth';

interface AuthRequiredCardProps {
  title?: string;
  message?: string;
}

export default function AuthRequiredCard({ title, message }: AuthRequiredCardProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);

  const handleLogin = () => {
    openWalletLogin({
      locale,
      onError: (error) => {
        if (error === 'popup_blocked') {
          alert(t('auth.popupBlocked'));
        }
      }
    });
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-8 h-8 text-[#FF3131]" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {title || t('auth.signIn')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message || t('auth.walletLoginInfo')}
        </p>
        <button onClick={handleLogin} className="btn-primary w-full flex items-center justify-center gap-2">
          <LogIn className="w-4 h-4" />
          {t('auth.loginWithWallet')}
        </button>
      </div>
    </div>
  );
}
