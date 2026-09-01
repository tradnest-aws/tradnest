"use client"

import { Button } from "@/components/atoms"
import Image from "next/image"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { JOIN_AS_SELLER_PATH } from "@/lib/helpers/locale-path"
import { useCopy } from "@/lib/i18n/useCopy"

export const BannerSection = () => {
  const t = useCopy()

  return (
    <section className="container" data-testid="supplier-banner">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch overflow-hidden rounded-3xl bg-tertiary text-tertiary">
        <div className="py-8 px-6 lg:p-12 flex flex-col h-full justify-between">
          <div className="mb-8">
            <span className="text-sm inline-block px-4 py-1 border border-tertiary/30 rounded-full mb-4">
              {t.bannerKicker}
            </span>
            <h2 className="heading-xl mb-4">{t.bannerTitle}</h2>
            <p className="text-lg max-w-lg opacity-90">{t.bannerBody}</p>
          </div>
          <LocalizedClientLink href={JOIN_AS_SELLER_PATH}>
            <Button size="large" className="w-fit rounded-2xl">
              {t.bannerCta}
            </Button>
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
