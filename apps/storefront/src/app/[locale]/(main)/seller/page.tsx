import { Button } from "@/components/atoms"
import { getCopy } from "@/lib/i18n/copy"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = getCopy(locale)
  return {
    title: t.sellerPageTitle,
    description: t.sellerHero,
  }
}

export default async function SellerLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = getCopy(locale)
  const vendorUrl =
    process.env.NEXT_PUBLIC_VENDOR_URL || t.vendorFallback

  return (
    <main className="container" data-testid="seller-landing">
      <section className="border rounded-sm p-6 md:p-10 max-w-3xl">
        <p className="label-sm uppercase mb-3">{t.bannerKicker}</p>
        <h1 className="heading-xl uppercase mb-4">{t.sellerPageTitle}</h1>
        <p className="text-lg mb-4">{t.sellerHero}</p>
        <p className="label-md text-secondary mb-8">{t.sellerBody}</p>
        <a href={vendorUrl} data-testid="seller-vendor-cta">
          <Button size="large" className="uppercase">
            {t.sellerCta}
          </Button>
        </a>
      </section>
      <section className="mt-8">
        <h2 className="heading-lg uppercase mb-6">{t.sellerHowTitle}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          <div className="border rounded-sm p-6">
            <p className="label-sm text-secondary mb-3">01</p>
            <h3 className="heading-md mb-3">{t.sellerStep1Title}</h3>
            <p className="label-md text-secondary">{t.sellerStep1Body}</p>
          </div>
          <div className="border rounded-sm p-6">
            <p className="label-sm text-secondary mb-3">02</p>
            <h3 className="heading-md mb-3">{t.sellerStep2Title}</h3>
            <p className="label-md text-secondary">{t.sellerStep2Body}</p>
          </div>
          <div className="border rounded-sm p-6">
            <p className="label-sm text-secondary mb-3">03</p>
            <h3 className="heading-md mb-3">{t.sellerStep3Title}</h3>
            <p className="label-md text-secondary">{t.sellerStep3Body}</p>
          </div>
        </div>
      </section>
    </main>
  )
}
