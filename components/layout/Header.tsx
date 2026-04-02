'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/lib/navigation';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, User, LogOut, Megaphone, Globe } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useTranslations } from 'next-intl';
import { openWalletLogin } from '@/lib/utils/walletAuth';
import Image from 'next/image';

export default function Header() {
  const t = useTranslations();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const getLocale = () => {
    const segments = pathname.split('/');
    const possibleLocale = segments[1];
    if (['en', 'ru'].includes(possibleLocale)) {
      return possibleLocale;
    }
    return 'az';
  };
  const locale = getLocale();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    setIsMounted(true);

    window.addEventListener('authStateChanged', checkAuth);
    return () => window.removeEventListener('authStateChanged', checkAuth);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.dispatchEvent(new Event('authStateChanged'));
    router.push('/');
  };

  const handleLoginClick = () => {
    setIsMenuOpen(false);
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
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/images/logo.svg"
              alt="Reklam.biz"
              width={130}
              height={32}
              className="dark:hidden"
              priority
            />
            <Image
              src="/images/logo-white.svg"
              alt="Reklam.biz"
              width={130}
              height={32}
              className="hidden dark:block"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex items-center gap-6 transition-opacity duration-300 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
            {isAuthenticated && (
              <>
                <Link
                  href="/advertiser"
                  className={`text-sm font-medium transition-colors ${
                    pathname.includes('/advertiser')
                      ? 'text-[#FF3131]'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {t('nav.advertiser')}
                </Link>
                <Link
                  href="/publisher"
                  className={`text-sm font-medium transition-colors ${
                    pathname.includes('/publisher')
                      ? 'text-[#FF3131]'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {t('nav.publisher')}
                </Link>
              </>
            )}

            <LanguageSwitcher locale={locale} />
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/settings"
                  className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLoginClick}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {t('nav.signIn')}
                </button>
                <button
                  onClick={handleLoginClick}
                  className="px-4 py-1.5 bg-[#FF3131] text-white text-sm font-medium rounded-lg hover:bg-[#E01B1B] transition-colors"
                >
                  {t('nav.getStarted')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-3 md:hidden">
            <LanguageSwitcher locale={locale} />
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && isMounted && (
          <div className="md:hidden py-3 border-t border-gray-200 dark:border-gray-800">
            {isAuthenticated ? (
              <div className="space-y-1">
                <Link
                  href="/advertiser"
                  className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.advertiser')}
                </Link>
                <Link
                  href="/publisher"
                  className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.publisher')}
                </Link>
                <Link
                  href="/settings"
                  className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.settings')}
                </Link>
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <button
                  onClick={handleLoginClick}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                >
                  {t('nav.signIn')}
                </button>
                <button
                  onClick={handleLoginClick}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-white bg-[#FF3131] hover:bg-[#E01B1B] rounded-lg"
                >
                  {t('nav.getStarted')}
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
