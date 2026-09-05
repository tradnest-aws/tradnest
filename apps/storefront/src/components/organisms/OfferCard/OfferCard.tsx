"use client"

import Image from "next/image"

import { Button } from "@/components/atoms"
import { toast } from "@/lib/helpers/toast"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { useCartContext, useSession } from "@/components/providers"
import { getOfferAmount, getOfferCurrency, getOfferStock, type StoreOffer } from "@/lib/helpers/buybox"
import { convertToLocale } from "@/lib/helpers/money"
import { cn } from "@/lib/utils"
import { useCopy } from "@/lib/i18n/useCopy"
import { useRouter } from "next/navigation"

export const OfferCard = ({
  offer,
  locale,
  className,
}: {
  offer: StoreOffer
  locale: string
  className?: string
}) => {
  const t = useCopy()
  const router = useRouter()
  const { isLoggedIn } = useSession()
  const { addToCart, onAddToCart, cart, isAddingItem } = useCartContext()

  const product = offer.product
  const productName = String(product?.title || t.productFallback)

  const amount = getOfferAmount(offer)
  const currency = getOfferCurrency(offer, cart?.currency_code || "ils")
  const stock = getOfferStock(offer)

  const hasPrice = amount !== null
  const displayPrice = hasPrice
    ? convertToLocale({ amount, currency_code: currency })
    : null

  const quantityInCart =
    cart?.items?.find((item) => item.metadata?.offer_id === offer.id)?.quantity ?? 0
  const isStockMaxLimitReached = quantityInCart >= stock
  const isAddToCartDisabled = !stock || isStockMaxLimitReached

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      router.push("/login?sessionRequired=true")
      return
    }
    if (isAddToCartDisabled) return

    const total = amount ?? 0
    const subtotal =
      offer.calculated_price?.calculated_amount_without_tax ?? total

    onAddToCart(
      {
        thumbnail: product?.thumbnail || "",
        product_title: product?.title,
        quantity: 1,
        subtotal,
        total,
        tax_total: total - subtotal,
        variant_id: offer.variant_id,
        product_id: offer.product_id,
        metadata: { offer_id: offer.id },
      },
      currency
    )

    try {
      await addToCart({ offerId: offer.id, quantity: 1, countryCode: locale })
    } catch {
      toast.error({
        title: t.addToCartError,
        description: t.addToCartErrorHint,
      })
    }
  }

  return (
    <div
      className={cn(
        "relative group border border-primary/10 rounded-2xl flex flex-col justify-between p-2 w-full lg:w-[calc(25%-1rem)] min-w-[250px] bg-primary shadow-sm hover:shadow-md transition-shadow",
        className
      )}
      data-testid="offer-card"
      data-offer-id={offer.id}
    >
      <div className="relative w-full h-full bg-secondary aspect-square rounded-xl overflow-hidden" data-testid="offer-card-image-container">
        <LocalizedClientLink
          href={`/products/${product?.handle}`}
          aria-label={t.viewProduct(productName)}
          title={t.viewProduct(productName)}
          data-testid="offer-card-link"
        >
          <div className="overflow-hidden w-full h-full flex justify-center align-center">
            <Image
              priority
              fetchPriority="high"
              src={product?.thumbnail ? decodeURIComponent(product.thumbnail) : "/images/placeholder.svg"}
              alt={t.productImageAlt(productName)}
              width={100}
              height={100}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-contain aspect-square w-full object-center h-full"
              data-testid="offer-card-image"
            />
          </div>
        </LocalizedClientLink>
      </div>
      <div className="flex flex-col gap-3 p-4" data-testid="offer-card-info">
        <LocalizedClientLink
          href={`/products/${product?.handle}`}
          aria-label={t.goToProduct(productName)}
          title={t.goToProduct(productName)}
        >
          <h3 className="heading-sm truncate" data-testid="offer-card-title">
            {productName}
          </h3>
          <div className="flex items-center gap-2 mt-2" data-testid="offer-card-price">
            {isLoggedIn && displayPrice ? (
              <p className="font-medium" data-testid="offer-card-current-price">
                {displayPrice}
              </p>
            ) : (
              <p className="label-md text-secondary" data-testid="offer-card-price-unavailable">
                {t.loginToSeePrice}
              </p>
            )}
          </div>
        </LocalizedClientLink>
        <Button
          onClick={handleAddToCart}
          disabled={isLoggedIn && isAddToCartDisabled}
          loading={isAddingItem}
          className="w-full py-3 flex justify-center rounded-xl"
          data-testid="offer-card-add-to-cart-button"
        >
          {!isLoggedIn ? t.loginToOrder : stock ? t.addToCart : t.outOfStock}
        </Button>
      </div>
    </div>
  )
}
