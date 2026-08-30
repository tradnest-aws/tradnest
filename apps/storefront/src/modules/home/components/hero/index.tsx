"use client"

import Button from "@/modules/common/components/button"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { Heading, Text } from "@medusajs/ui"

const Hero = () => {
  return (
    <div className="w-full border-b border-ui-border-base relative bg-neutral-950 text-white">
      <div className="content-container flex flex-col justify-center gap-6 py-20 small:py-32">
        <Text className="text-xs uppercase tracking-[0.2em] text-neutral-400">
          Tradnest B2B marketplace
        </Text>
        <Heading
          level="h1"
          className="text-4xl small:text-6xl leading-tight text-white font-normal max-w-3xl"
        >
          Source from verified vendors. Buy as a company.
        </Heading>
        <Text className="text-lg text-neutral-300 max-w-2xl">
          A wholesale catalog for procurement teams: multiple suppliers, company
          accounts, spending limits, quote requests, and order approvals.
        </Text>
        <div className="flex flex-wrap gap-3">
          <LocalizedClientLink href="/store">
            <Button className="rounded-2xl">Browse catalog</Button>
          </LocalizedClientLink>
          <LocalizedClientLink href="/vendors">
            <Button variant="secondary" className="rounded-2xl">
              View vendors
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default Hero
