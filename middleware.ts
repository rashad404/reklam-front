import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n-config';

const LOCALE_COOKIE = 'NEXT_LOCALE';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.includes('_next') ||
    pathname.includes('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const nonDefaultLocales = i18n.locales.filter(locale => locale !== 'az');
  const hasNonDefaultLocale = nonDefaultLocales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  const hasAzPrefix = pathname.startsWith('/az/') || pathname === '/az';

  if (hasAzPrefix) {
    const newPathname = pathname.replace(/^\/az(\/|$)/, '/');
    const url = new URL(newPathname || '/', request.url);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }

  const savedLocale = request.cookies.get(LOCALE_COOKIE)?.value;

  if (!hasNonDefaultLocale && savedLocale && savedLocale !== 'az' && i18n.locales.includes(savedLocale as any)) {
    const newPathname = `/${savedLocale}${pathname === '/' ? '' : pathname}`;
    const url = new URL(newPathname, request.url);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }

  if (!hasNonDefaultLocale) {
    const newUrl = `/az${pathname === '/' ? '' : pathname}`;
    const url = new URL(newUrl, request.url);
    url.search = request.nextUrl.search;
    return NextResponse.rewrite(url);
  }

  const response = NextResponse.next();

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Cache-Control', 's-maxage=1, stale-while-revalidate');
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
