"use client"
import { Button } from "@/components/atoms"
import { ArrowRightIcon } from "@/icons"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { SELLER_REGISTER_PATH } from "@/lib/helpers/locale-path"
import { useCopy } from "@/lib/i18n/useCopy"

export const SellNowButton = () => {
  const t = useCopy()
  return (
    <LocalizedClientLink href={SELLER_REGISTER_PATH}>
      <Button className="group !font-bold ps-12 gap-1 flex items-center rounded-2xl">
        {t.becomeSupplier}
        <ArrowRightIcon
          color="white"
          className="w-5 h-5 group-hover:opacity-100 opacity-0 transition-all duration-300 rtl-flip"
        />
      </Button>
    </LocalizedClientLink>
  )
}
