import {
  BannerSection,
  Hero,
  HomeCategories,
  HomeProductSection,
  HomeStats,
  HowProcurementWorksSection,
} from "@/components/sections"

import type { Metadata } from "next"
import { headers } from "next/headers"
import Script from "next/script"
import { listRegions } from "@/lib/data/regions"
import {
  buildHreflangAlternates,
  getStorefrontLocales,
  toHreflang,
} from "@/lib/helpers/hreflang"
import { getCopy } from "@/lib/i18n/copy"
import { publicPageUrl } from "@/lib/helpers/locale-path"

const DEFAULT_SITE_NAME = "טרדנסט — שוק סיטונאי B2B"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = getCopy(locale)

  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  let locales: string[] = []
  try {
    locales = getStorefrontLocales(await listRegions())
  } catch {
    locales = [locale]
  }

  const { canonical, languages } = buildHreflangAlternates({
    baseUrl,
    path: "",
    locale,
    locales,
  })

  const title = t.homeTitle
  const description = t.homeDescription
  const ogImage = "/tradnest-logo.png"

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: `${title} | ${
        process.env.NEXT_PUBLIC_SITE_NAME || DEFAULT_SITE_NAME
      }`,
      description,
      url: canonical,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || DEFAULT_SITE_NAME,
      type: "website",
      images: [
        {
          url: ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: process.env.NEXT_PUBLIC_SITE_NAME || DEFAULT_SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`],
    },
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = getCopy(locale)

  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || DEFAULT_SITE_NAME

  return (
    <main className="flex w-full flex-col gap-10 lg:gap-14 items-stretch text-primary">
      <link
        rel="preload"
        as="image"
        href="/images/hero/Image.jpg"
        imageSrcSet="/images/hero/Image.jpg 700w"
        imageSizes="(min-width: 1024px) 50vw, 100vw"
      />
      <Script
        id="ld-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteName,
            url: publicPageUrl(baseUrl, locale, "/"),
            logo: `${baseUrl}/tradnest-icon.png`,
          }),
        }}
      />
      <Script
        id="ld-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteName,
            url: publicPageUrl(baseUrl, locale, "/"),
            inLanguage: toHreflang(locale),
          }),
        }}
      />

      <Hero
        image="/images/hero/Image.jpg"
        heading={t.heroHeading}
        paragraph={t.heroParagraph}
        buttons={[
          { label: t.heroCatalog, path: "/categories" },
          { label: t.heroSeller, path: "/seller/register" },
        ]}
      />
      <HomeStats />
      <HomeCategories heading={t.byCategory} locale={locale} />
      <HomeProductSection heading={t.featured} locale={locale} home />
      <BannerSection />
      <HowProcurementWorksSection />
    </main>
  )
}
