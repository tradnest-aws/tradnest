"use client"

import { Button } from "@/components/atoms"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { useCopy } from "@/lib/i18n/useCopy"

export function CartEmpty() {
  const t = useCopy()
  return (
    <div className="col-span-12 pt-4 py-6 flex justify-center" data-testid="cart-empty">
      <div className="w-[466px] flex flex-col">
        <h2 className="text-primary heading-lg text-center">{t.cart}</h2>
        <p className="mt-2 text-lg text-secondary text-center">
          {t.cartEmpty}
        </p>
        <LocalizedClientLink href="/categories" className="mt-6">
          <Button className="w-full py-3 flex justify-center items-center">
            {t.exploreCatalog}
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
