import type { Metadata } from 'next';
import { Heebo } from 'next/font/google';

import './globals.css';

import { Toaster } from '@medusajs/ui';
import Head from 'next/head';

import { HtmlLangSetter } from '@/components/atoms/HtmlLangSetter/HtmlLangSetter';
import { retrieveCart } from '@/lib/data/cart';
import { retrieveCustomer } from '@/lib/data/customer';

import { Providers } from './providers';

const heebo = Heebo({
  variable: '--font-heebo',
  subsets: ['latin', 'hebrew'],
  weight: ['400', '500', '600', '700', '800']
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${
      process.env.NEXT_PUBLIC_SITE_NAME || 'טרדנסט — שוק סיטונאי B2B'
    }`,
    default: process.env.NEXT_PUBLIC_SITE_NAME || 'טרדנסט — שוק סיטונאי B2B'
  },
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    'טרדנסט הוא שוק B2B לספקים בישראל. משווים הצעות, מבקשים הצעות מחיר ומזמינים במשלוח לכל הארץ.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/tradnest-icon.png', type: 'image/png' }
    ],
    apple: '/tradnest-icon.png'
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cart, customer] = await Promise.all([
    retrieveCart(),
    retrieveCustomer()
  ]);
  const htmlLang = 'he-IL';
  const dir = 'rtl';

  return (
    <html
      lang={htmlLang}
      dir={dir}
      className={heebo.variable}
    >
      <Head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://fonts.gstatic.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://i.imgur.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://i.imgur.com"
        />
        {/* Image origins for faster LCP */}
        <link
          rel="preconnect"
          href="https://medusa-public-images.s3.eu-west-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://medusa-public-images.s3.eu-west-1.amazonaws.com"
        />
        <link
          rel="preconnect"
          href="https://mercur-connect.s3.eu-central-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://mercur-connect.s3.eu-central-1.amazonaws.com"
        />
        <link
          rel="preconnect"
          href="https://s3.eu-central-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://s3.eu-central-1.amazonaws.com"
        />
        <link
          rel="preconnect"
          href="https://api.mercurjs.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://api.mercurjs.com"
        />
      </Head>
      <body
        dir={dir}
        className={`${heebo.className} relative bg-secondary text-secondary antialiased`}
      >
        <HtmlLangSetter />
        <Providers cart={cart} isLoggedIn={Boolean(customer)}>
          {children}
        </Providers>
        <Toaster position={dir === 'rtl' ? 'top-left' : 'top-right'} />
      </body>
    </html>
  );
}
