"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Badge, Button } from "@/components/atoms"
import { SellerAvatar } from "@/components/cells/SellerAvatar/SellerAvatar"
import { Modal } from "@/components/molecules/Modal/Modal"
import { useCartContext, useSession } from "@/components/providers"
import { convertToLocale } from "@/lib/helpers/money"
import { toast } from "@/lib/helpers/toast"
import { useCopy } from "@/lib/i18n/useCopy"
import {
  getOfferAmount,
  getOfferCurrency,
  getOfferStock,
  isPurchasable,
  rankOffers,
  StoreOffer,
} from "@/lib/helpers/buybox"

export const CompareOffersModal = ({
  offers,
  locale,
  variantLabel,
  onClose,
}: {
  offers: StoreOffer[]
  locale: string
  variantLabel?: string
  onClose: () => void
}) => {
  const t = useCopy()
  const router = useRouter()
  const { isLoggedIn } = useSession()
  const { addToCart } = useCartContext()
  const [addingId, setAddingId] = useState<string | null>(null)

  const ranked = rankOffers(offers)

  const handleAdd = async (offer: StoreOffer) => {
    if (!isLoggedIn) {
      router.push("/login?sessionRequired=true")
      return
    }
    setAddingId(offer.id)
    try {
      await addToCart({ offerId: offer.id, quantity: 1, countryCode: locale })
      toast.success({ title: t.addedToCart })
    } catch {
      toast.error({
        title: t.addToCartError,
        description: t.addToCartErrorHint,
      })
    } finally {
      setAddingId(null)
    }
  }

  return (
    <Modal
      heading={t.compareOffersHeading(ranked.length)}
      onClose={onClose}
      data-testid="compare-offers-modal"
    >
      <div className="flex flex-col gap-3 p-4">
        {variantLabel && (
          <p className="label-md text-secondary" data-testid="compare-offers-variant">
            {variantLabel}
          </p>
        )}
        {ranked.map((offer, index) => {
          const amount = getOfferAmount(offer)
          const stock = getOfferStock(offer)
          const buyable = isPurchasable(offer)

          return (
            <div
              key={offer.id}
              className="flex items-center justify-between gap-4 border border-primary/10 rounded-2xl p-4"
              data-testid="compare-offer-row"
              data-offer-id={offer.id}
            >
              <div className="flex items-center gap-3 min-w-0">
                <SellerAvatar
                  photo={offer.seller?.logo || ""}
                  size={40}
                  alt={offer.seller?.name || t.sellerFallback}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="label-lg text-primary truncate">
                      {offer.seller?.name || t.sellerFallback}
                    </p>
                    {index === 0 && buyable && (
                      <Badge className="bg-positive">{t.bestPrice}</Badge>
                    )}
                    {offer.seller?.is_premium && (
                      <Badge className="bg-warning">{t.premium}</Badge>
                    )}
                  </div>
                  <p className="label-sm text-secondary">
                    {buyable ? t.inStockCount(stock) : t.outOfStock}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="heading-sm text-primary" data-testid="compare-offer-price">
                  {!isLoggedIn
                    ? t.loginToSeePrice
                    : amount !== null
                    ? convertToLocale({
                        amount,
                        currency_code: getOfferCurrency(offer, "ils"),
                      })
                    : "—"}
                </span>
                <Button
                  size="small"
                  onClick={() => handleAdd(offer)}
                  disabled={isLoggedIn && (!buyable || addingId !== null)}
                  loading={addingId === offer.id}
                  data-testid="compare-offer-add-to-cart"
                >
                  {isLoggedIn ? t.addToCart : t.loginToOrder}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
