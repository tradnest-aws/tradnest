import 'server-only';
import { cookies as nextCookies, headers as nextHeaders } from 'next/headers';

import { shouldUseSecureAuthCookie } from '../helpers/auth-cookie';

export const getAuthHeaders = async (): Promise<
  { authorization: string } | {}
> => {
  const cookies = await nextCookies();
  const token = cookies.get('_medusa_jwt')?.value;

  if (!token) {
    return {};
  }

  return { authorization: `Bearer ${token}` };
};

export const getCacheTag = async (
  tag: string
): Promise<string> => {
  try {
    const cookies = await nextCookies();
    const cacheId = cookies.get('_medusa_cache_id')?.value;

    if (!cacheId) {
      return '';
    }

    return `${tag}-${cacheId}`;
  } catch (error) {
    return '';
  }
};

export const getCacheOptions = async (
  tag: string
): Promise<{ tags: string[] } | {}> => {
  if (typeof window !== 'undefined') {
    return {};
  }

  const cacheTag = await getCacheTag(tag);

  if (!cacheTag) {
    return {};
  }

  return { tags: [`${cacheTag}`] };
};

export const setAuthToken = async (token: string) => {
  const cookies = await nextCookies();
  const headerList = await nextHeaders();
  cookies.set('_medusa_jwt', token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: 'lax',
    secure: shouldUseSecureAuthCookie({
      cookieSecureEnv: process.env.COOKIE_SECURE,
      forwardedProto: headerList.get('x-forwarded-proto'),
    }),
    path: '/',
  });
};

export const removeAuthToken = async () => {
  const cookies = await nextCookies();
  cookies.set('_medusa_jwt', '', {
    maxAge: -1,
  });
};

export const getCartId = async () => {
  const cookies = await nextCookies();
  return cookies.get('_medusa_cart_id')?.value;
};

const cartCookieBase = async () => {
  const headerList = await nextHeaders();
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    // Production sets NODE_ENV=production, but this host is HTTP. A Secure
    // cart cookie is dropped, so the next add looks like the cart was emptied.
    secure: shouldUseSecureAuthCookie({
      cookieSecureEnv: process.env.COOKIE_SECURE,
      forwardedProto: headerList.get('x-forwarded-proto'),
    }),
    path: '/',
  };
};

export const setCartId = async (cartId: string) => {
  const cookies = await nextCookies();
  cookies.set('_medusa_cart_id', cartId, {
    ...(await cartCookieBase()),
    maxAge: 60 * 60 * 24 * 7,
  });
};

export const removeCartId = async () => {
  const cookies = await nextCookies();
  cookies.set('_medusa_cart_id', '', {
    ...(await cartCookieBase()),
    maxAge: -1,
  });
};
