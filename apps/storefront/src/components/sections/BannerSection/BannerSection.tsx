"use client"

import Image from "next/image"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { SELLER_REGISTER_PATH } from "@/lib/helpers/locale-path"
import { useCopy } from "@/lib/i18n/useCopy"

export const BannerSection = () => {
  const t = useCopy()

  return (
    <section className="storefront-shell" data-testid="supplier-banner">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch overflow-hidden rounded-[32px] bg-[rgb(var(--bg-tertiary))] text-white">
        <div className="py-10 px-6 lg:p-12 flex flex-col h-full justify-between gap-8">
          <div>
            <span className="text-sm inline-block px-4 py-1 rounded-full mb-4 bg-primary/10">
              {t.bannerKicker}
            </span>
            <h2 className="heading-xl font-bold mb-4">{t.bannerTitle}</h2>
            <p className="text-lg max-w-lg opacity-90">{t.bannerBody}</p>
          </div>
          <LocalizedClientLink
            href={SELLER_REGISTER_PATH}
            className="inline-flex w-fit items-center rounded-full bg-[rgba(var(--brand-100))] text-primary px-6 py-3 font-semibold hover:opacity-90"
          >
            {t.bannerCta}
          </LocalizedClientLink>
        </div>
        <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[360px]">
          <Image
            loading="lazy"
            src="/images/banner-section/Image.jpg"
            alt={t.bannerAlt}
            fill
            className="object-cover object-top"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </div>
    </section>
  )
}
