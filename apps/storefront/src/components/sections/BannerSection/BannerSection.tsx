"use client"

import { Button } from "@/components/atoms"
import Image from "next/image"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { useCopy } from "@/lib/i18n/useCopy"

export const BannerSection = () => {
  const t = useCopy()

  return (
    <section className="bg-tertiary container text-tertiary" data-testid="supplier-banner">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
        <div className="py-6 px-6 flex flex-col h-full justify-between border border-secondary rounded-sm">
          <div className="mb-8 lg:mb-48">
            <span className="text-sm inline-block px-4 py-1 border border-secondary rounded-sm">
              {t.bannerKicker}
            </span>
            <h2 className="display-sm">{t.bannerTitle}</h2>
            <p className="text-lg text-tertiary max-w-lg">{t.bannerBody}</p>
          </div>
          <LocalizedClientLink href="/seller">
            <Button size="large" className="w-fit bg-secondary/10">
              {t.bannerCta}
            </Button>
          </LocalizedClientLink>
        </div>
        <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full flex justify-end rounded-sm">
          <Image
            loading="lazy"
            fetchPriority="high"
            src="/images/banner-section/Image.jpg"
            alt="Warehouse aisle representing wholesale supply"
            width={700}
            height={600}
            className="object-cover object-top rounded-sm"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </div>
    </section>
  )
}
