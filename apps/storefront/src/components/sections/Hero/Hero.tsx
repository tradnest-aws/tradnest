"use client"

import Image from "next/image"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

import { ArrowRightIcon } from "@/icons"
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
    <section className="w-full container mt-4">
      <div className="relative overflow-hidden rounded-3xl bg-tertiary text-tertiary min-h-[420px] lg:min-h-[520px]">
        <Image
          src={decodeURIComponent(image)}
          fill
          alt={t.heroBannerAlt(heading)}
          className="object-cover opacity-40"
          priority
          fetchPriority="high"
          quality={60}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-tertiary via-tertiary/80 to-tertiary/40" />
        <div className="relative z-10 flex flex-col justify-end gap-6 p-6 md:p-12 lg:p-16 max-w-3xl">
          <p className="label-sm tracking-wide text-action">{t.bannerKicker}</p>
          <h1 className="font-semibold text-4xl md:text-5xl leading-tight">
            {heading}
          </h1>
          <p className="text-lg text-tertiary/90 max-w-xl">{paragraph}</p>
          {buttons.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              {buttons.map(({ label, path }, index) => {
                const className =
                  index === 0
                    ? "inline-flex items-center justify-between gap-3 rounded-2xl bg-action text-action-on-primary px-6 py-4 font-semibold hover:opacity-90 transition-opacity"
                    : "inline-flex items-center justify-between gap-3 rounded-2xl border border-tertiary/40 px-6 py-4 font-semibold hover:bg-tertiary/40 transition-colors"
                const inner = (
                  <>
                    <span>{label}</span>
                    <ArrowRightIcon
                      color="currentColor"
                      aria-hidden
                      className="rtl-flip w-5 h-5"
                    />
                  </>
                )
                if (path.startsWith("http")) {
                  return (
                    <a
                      key={path}
                      href={path}
                      className={className}
                      aria-label={label}
                      title={label}
                    >
                      {inner}
                    </a>
                  )
                }
                return (
                  <LocalizedClientLink
                    key={path}
                    href={path}
                    className={className}
                    aria-label={label}
                    title={label}
                  >
                    {inner}
                  </LocalizedClientLink>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
