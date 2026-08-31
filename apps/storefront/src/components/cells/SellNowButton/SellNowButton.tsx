"use client"
import { Button } from "@/components/atoms"
import { ArrowRightIcon } from "@/icons"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { useCopy } from "@/lib/i18n/useCopy"

export const SellNowButton = () => {
  const t = useCopy()
  return (
    <LocalizedClientLink href="/seller">
      <Button className="group uppercase !font-bold ps-12 gap-1 flex items-center">
        {t.becomeSupplier}
        <ArrowRightIcon
          color="white"
          className="w-5 h-5 group-hover:opacity-100 opacity-0 transition-all duration-300 rtl-flip"
        />
      </Button>
    </LocalizedClientLink>
  )
}
