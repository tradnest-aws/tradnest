"use client"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { useCartContext } from "@/components/providers"
import { convertToLocale } from "@/lib/helpers/money"
import { useCopy } from "@/lib/i18n/useCopy"

const sellerIdOf = (item: {
  offer?: {
    seller?: { id?: string | null } | null
    seller_id?: string | null
  } | null
  metadata?: Record<string, unknown> | null
}) => {
  const fromOffer = item.offer?.seller?.id || item.offer?.seller_id || ""
  const fromMeta = item.metadata?.seller_id
  if (typeof fromOffer === "string" && fromOffer.trim()) return fromOffer.trim()
  if (typeof fromMeta === "string" && fromMeta.trim()) return fromMeta.trim()
  return ""
}

export const SellerCartStrip = ({ sellerId }: { sellerId: string }) => {
  const t = useCopy()
  const { cart } = useCartContext()
  const items = cart?.items ?? []
  if (!items.length) return null

  const sellerIds = items.map((item) =>
    sellerIdOf(
      item as {
        offer?: {
          seller?: { id?: string | null } | null
          seller_id?: string | null
        } | null
        metadata?: Record<string, unknown> | null
      }
    )
  )
  const belongsToSeller =
    sellerIds.every((id) => id.length > 0) &&
    sellerIds.every((id) => id === sellerId)
  if (!belongsToSeller) return null

  const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const subtotal = convertToLocale({
    amount: cart?.item_subtotal || 0,
    currency_code: cart?.currency_code || "ils",
    locale: "he-IL",
  })

  return (
    <div
      className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-primary/10 bg-primary px-4 py-3"
      data-testid="seller-cart-strip"
    >
      <p className="label-md text-primary">
        {t.sellerCartItems(count)} · {subtotal}
      </p>
      <LocalizedClientLink
        href="/cart"
        className="label-md font-semibold text-action hover:text-action-hover"
      >
        {t.sellerGoToCart}
      </LocalizedClientLink>
    </div>
  )
}
