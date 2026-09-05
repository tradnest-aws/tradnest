"use client"

import Image from "next/image"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { NavbarSearch } from "@/components/molecules/NavbarSearch/NavbarSearch"
import { SELLER_REGISTER_PATH } from "@/lib/helpers/locale-path"
import { useCopy } from "@/lib/i18n/useCopy"

type HeroProps = {
  image: string
  heading: string
  paragraph: string
  buttons: { label: string; path: string }[]
}

export const Hero = ({ image, heading, paragraph, buttons }: HeroProps) => {
  const t = useCopy()

  return (
    <section className="w-full storefront-shell pt-6 lg:pt-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="flex flex-col gap-5 max-w-xl">
          <p className="inline-flex w-fit items-center rounded-full bg-primary border border-primary/10 px-3 py-1 label-sm font-medium text-action">
            {t.heroKicker}
          </p>
          <h1 className="font-extrabold text-4xl md:text-5xl lg:text-[56px] leading-[1.1] tracking-tight text-primary">
            {heading}
          </h1>
          <p className="text-lg text-secondary max-w-lg">{paragraph}</p>
          <NavbarSearch variant="hero" className="mt-1" />
          {buttons.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-1">
              {buttons.map(({ label, path }, index) => {
                const className =
                  index === 0
                    ? "inline-flex items-center justify-center rounded-full bg-action text-white px-6 py-3 font-semibold hover:bg-action-hover transition-colors"
                    : "inline-flex items-center justify-center rounded-full border border-primary/15 bg-primary px-6 py-3 font-semibold text-primary hover:bg-secondary transition-colors"
                if (path.startsWith("http") || path.startsWith("/seller")) {
                  return (
                    <a key={path} href={path} className={className}>
                      {label}
                    </a>
                  )
                }
                return (
                  <LocalizedClientLink key={path} href={path} className={className}>
                    {label}
                  </LocalizedClientLink>
                )
              })}
            </div>
          )}
        </div>
        <div className="relative min-h-[320px] lg:min-h-[480px]">
          <div className="absolute inset-6 rounded-[40px] bg-[rgba(var(--brand-100),0.35)]" />
          <div className="relative overflow-hidden rounded-[32px] shadow-[0_24px_60px_rgba(16,24,40,0.18)] aspect-[5/4] lg:aspect-auto lg:h-full">
            <Image
              src={decodeURIComponent(image)}
              fill
              alt={t.heroBannerAlt(heading)}
              className="object-cover"
              priority
              fetchPriority="high"
              quality={60}
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div className="absolute start-4 bottom-6 storefront-card px-4 py-3 max-w-[220px]">
            <p className="label-sm text-secondary">{t.statSuppliersLabel}</p>
            <p className="heading-sm text-primary mt-1">{t.statSuppliersValue}</p>
          </div>
          <LocalizedClientLink
            href={SELLER_REGISTER_PATH}
            className="absolute end-4 top-8 rounded-full bg-primary px-4 py-2 label-md font-semibold text-primary shadow-[0_8px_24px_rgba(16,24,40,0.12)]"
          >
            {t.becomeSupplier}
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}
