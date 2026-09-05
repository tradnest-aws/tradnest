import { HttpTypes } from '@medusajs/types';
import { NextRequest, NextResponse } from 'next/server';

import { PROTECTED_ROUTES } from './lib/constants';
import { isTokenExpired } from './lib/helpers/token';
import { resolvePublicOrigin } from './lib/helpers/public-origin';

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL;
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || 'il';

const PASSTHROUGH_FIRST_SEGMENTS = new Set([
  'seller',
  'app',
  'vendor',
  'store',
  'hooks',
  'static',
  'auth'
]);

const publicOrigin = (req: NextRequest) =>
  resolvePublicOrigin({
    configuredBaseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    forwardedHost: req.headers.get('x-forwarded-host'),
    forwardedProto: req.headers.get('x-forwarded-proto'),
    host: req.headers.get('host'),
    fallbackOrigin: req.nextUrl.origin,
  });

const withLocaleHeaders = (headers: Headers, locale: string) => {
  headers.set('x-locale', locale.toLowerCase());
  headers.set(
    'x-locale-dir',
    locale.toLowerCase() === 'il' ? 'rtl' : 'ltr'
  );
};

const makeAuthRedirect = (
  req: NextRequest,
  reason: 'sessionRequired' | 'sessionExpired'
) => {
  const redirectUrl = new URL('/login', `${publicOrigin(req)}/`);

  redirectUrl.searchParams.set(reason, 'true');

  const response = NextResponse.redirect(redirectUrl);

  if (reason === 'sessionExpired') {
    response.cookies.delete('_medusa_jwt');
  }

  return response;
};

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now()
};

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache;

  if (!BACKEND_URL) {
    throw new Error(
      'Middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL.'
    );
  }

  if (!regionMap.keys().next().value || regionMapUpdated < Date.now() - 3600 * 1000) {
    const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY!
      },
      next: {
        revalidate: 3600,
        tags: [`regions-${cacheId}`]
      },
      cache: 'force-cache'
    }).then(async response => {
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message);
      }

      return json;
    });

    if (!regions?.length) {
      throw new Error('No regions found. Please set up regions in your Medusa Admin.');
    }

    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach(c => {
        regionMapCache.regionMap.set(c.iso_2 ?? '', region);
      });
    });

    regionMapCache.regionMapUpdated = Date.now();
  }

  return regionMapCache.regionMap;
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const queryString = request.nextUrl.search ? request.nextUrl.search : '';
  const cacheIdCookie = request.cookies.get('_medusa_cache_id');
  const cacheId = cacheIdCookie?.value || crypto.randomUUID();

  const urlSegment = pathname.split('/')[1] || '';
  const looksLikeLocale = /^[a-z]{2}$/i.test(urlSegment);
  const pathnameWithoutLocale = looksLikeLocale
    ? pathname.replace(/^\/[^/]+/, '') || '/'
    : pathname;

  if (pathname === '/il/seller' || pathname === '/il/seller/') {
    const redirectUrl = `${publicOrigin(request)}/join-as-seller${queryString}`;
    return NextResponse.redirect(redirectUrl, 308);
  }

  if (urlSegment && PASSTHROUGH_FIRST_SEGMENTS.has(urlSegment)) {
    return NextResponse.next();
  }

  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    pathnameWithoutLocale.startsWith(route)
  );

  if (isProtectedRoute) {
    const jwtCookie = request.cookies.get('_medusa_jwt');
    const token = jwtCookie?.value;

    if (!jwtCookie) {
      return makeAuthRedirect(request, 'sessionRequired');
    }

    if (token && isTokenExpired(token)) {
      return makeAuthRedirect(request, 'sessionExpired');
    }
  }

  try {
    await getRegionMap(cacheId);
  } catch {
    // Region fetch is used to warm the cache; Israel is the only public locale.
  }

  const requestHeaders = new Headers(request.headers);
  withLocaleHeaders(requestHeaders, DEFAULT_REGION);

  const withCacheCookie = (response: NextResponse) => {
    if (!cacheIdCookie) {
      response.cookies.set('_medusa_cache_id', cacheId, {
        maxAge: 60 * 60 * 24
      });
    }
    return response;
  };

  // App routes live under [locale]=il. Public URLs have no prefix, so `/` is
  // rewritten to `/il`. Next then runs this middleware again on `/il`. A 308
  // back to `/` here created an infinite redirect (location `/` + rewrite `/il`).
  if (looksLikeLocale && urlSegment.toLowerCase() === DEFAULT_REGION) {
    return withCacheCookie(
      NextResponse.next({
        request: {
          headers: requestHeaders
        }
      })
    );
  }

  if (looksLikeLocale) {
    const redirectUrl = `${publicOrigin(request)}${pathnameWithoutLocale}${queryString}`;
    return NextResponse.redirect(redirectUrl, 308);
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname =
    pathname === '/' ? `/${DEFAULT_REGION}` : `/${DEFAULT_REGION}${pathname}`;

  return withCacheCookie(
    NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: requestHeaders
      }
    })
  );
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)'
  ]
};
