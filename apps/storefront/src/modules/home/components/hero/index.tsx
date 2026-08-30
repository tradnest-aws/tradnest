"use client"

import Button from "@/modules/common/components/button"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import TradnestLogo from "@/modules/common/components/tradnest-logo"
import { Heading, Text } from "@medusajs/ui"

const Hero = () => {
  return (
    <div className="w-full relative bg-brand-navy text-white">
      <div className="absolute inset-x-0 top-0 h-1 bg-brand-gold" />
      <div className="content-container flex flex-col justify-center gap-6 py-20 small:py-32">
        <TradnestLogo markOnly height={56} className="rounded-2xl" />
        <Text className="text-xs uppercase tracking-[0.2em] text-brand-gold">
          Tradnest B2B marketplace
        </Text>
        <Heading
          level="h1"
          className="text-4xl small:text-6xl leading-tight text-white font-normal max-w-3xl"
        >
          Source from verified vendors. Buy as a company.
        </Heading>
        <Text className="text-lg text-white/75 max-w-2xl">
          A wholesale catalog for procurement teams: multiple suppliers, company
          accounts, spending limits, quote requests, and order approvals.
        </Text>
        <div className="flex flex-wrap gap-3">
          <LocalizedClientLink href="/store">
            <Button className="rounded-2xl !bg-brand-gold !text-brand-navy hover:!bg-brand-gold-hover">
              Browse catalog
            </Button>
          </LocalizedClientLink>
          <LocalizedClientLink href="/vendors">
            <Button
              variant="secondary"
              className="rounded-2xl !bg-transparent !text-white !border-white/25 hover:!bg-white/10"
            >
              View vendors
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default Hero
