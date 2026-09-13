import { NextRequest, NextResponse } from "next/server";
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/az" || path.startsWith("/az/")) {
    const url = request.nextUrl.clone();
    url.pathname = path.replace(/^\/az/, "") || "/";
    return NextResponse.redirect(url, 308);
  }
  const locale = /^\/(en|ru)(\/|$)/.exec(path)?.[1] || "az";
  const headers = new Headers(request.headers);
  headers.set("x-reklam-locale", locale);
  headers.set("x-reklam-path", path.replace(/^\/(en|ru)(?=\/|$)/, "") || "/");
  headers.set("x-next-intl-locale", locale);
  const response =
    locale === "az" && !path.startsWith("/auth/")
      ? NextResponse.rewrite(
          new URL(
            "/az" + (path === "/" ? "" : path) + request.nextUrl.search,
            request.url,
          ),
          { request: { headers } },
        )
      : NextResponse.next({ request: { headers } });
  if (
    /^\/(advertiser|publisher|admin|settings|auth)(\/|$)/.test(
      headers.get("x-reklam-path")!,
    )
  ) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "private, no-store");
  }
  return response;
}
export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
