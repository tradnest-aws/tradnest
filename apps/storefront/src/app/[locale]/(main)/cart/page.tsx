import { Cart } from '@/components/sections';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { DEFAULT_STOREFRONT_LOCALE, getCopy } from '@/lib/i18n/copy';

export const metadata: Metadata = {
  title: 'עגלה',
  description: 'עגלת ההזמנה',
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const t = getCopy(
    (await headers()).get('x-locale') || DEFAULT_STOREFRONT_LOCALE
  );
  return (
    <main className='container grid grid-cols-12'>
      <Suspense fallback={<>{t.loading}</>}>
        <Cart />
      </Suspense>
    </main>
  );
}
