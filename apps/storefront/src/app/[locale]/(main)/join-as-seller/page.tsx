import { Button } from "@/components/atoms"
import { getCopy } from "@/lib/i18n/copy"
import {
  SELLER_LOGIN_PATH,
  SELLER_REGISTER_PATH,
} from "@/lib/helpers/locale-path"
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

  return (
    <main className="storefront-shell py-10" data-testid="seller-landing">
      <section className="rounded-[32px] bg-[rgb(var(--bg-tertiary))] text-white p-8 md:p-12 max-w-4xl">
        <p className="label-sm mb-3 text-white/80">{t.bannerKicker}</p>
        <h1 className="heading-xl mb-4 text-white">{t.sellerPageTitle}</h1>
        <p className="text-lg mb-4 text-white">{t.sellerHero}</p>
        <p className="label-md text-white/80 mb-8">{t.sellerBody}</p>
        <div className="flex flex-wrap gap-3">
          <Button
            href={SELLER_REGISTER_PATH}
            size="large"
            className="rounded-full"
            data-testid="seller-register-cta"
          >
            {t.sellerRegisterCta}
          </Button>
          <Button
            href={SELLER_LOGIN_PATH}
            variant="tonal"
            size="large"
            className="rounded-full !bg-transparent border border-white/40 !text-white hover:!bg-white/10"
            data-testid="seller-vendor-cta"
          >
            {t.sellerCta}
          </Button>
        </div>
      </section>
      <section className="mt-10">
        <h2 className="heading-lg mb-6">{t.sellerHowTitle}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="storefront-card p-6">
            <p className="label-sm text-secondary mb-3">01</p>
            <h3 className="heading-md mb-3">{t.sellerStep1Title}</h3>
            <p className="label-md text-secondary">{t.sellerStep1Body}</p>
          </div>
          <div className="storefront-card p-6">
            <p className="label-sm text-secondary mb-3">02</p>
            <h3 className="heading-md mb-3">{t.sellerStep2Title}</h3>
            <p className="label-md text-secondary">{t.sellerStep2Body}</p>
          </div>
          <div className="storefront-card p-6">
            <p className="label-sm text-secondary mb-3">03</p>
            <h3 className="heading-md mb-3">{t.sellerStep3Title}</h3>
            <p className="label-md text-secondary">{t.sellerStep3Body}</p>
          </div>
        </div>
      </section>
    </main>
  )
}
