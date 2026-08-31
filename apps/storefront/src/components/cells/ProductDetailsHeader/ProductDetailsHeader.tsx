"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/atoms"
import { HttpTypes } from "@medusajs/types"
import { ProductVariants } from "@/components/molecules"
import useGetAllSearchParams from "@/hooks/useGetAllSearchParams"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { convertToLocale } from "@/lib/helpers/money"
import {
  getBuyboxWinner,
  getOfferAmount,
  getOfferStock,
  getVariantOffers,
  StoreOffer,
} from "@/lib/helpers/buybox"
import { Chat } from "@/components/organisms/Chat/Chat"
import { CompareOffersModal } from "@/components/organisms/CompareOffersModal/CompareOffersModal"
import { RequestQuoteModal } from "@/components/organisms/RequestQuoteModal/RequestQuoteModal"
import { SellerDTO } from "@mercurjs/types"
import { toast } from "@/lib/helpers/toast"
import { useCartContext } from "@/components/providers"
import { useCopy } from "@/lib/i18n/useCopy"

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce(
    (
      acc: Record<string, string>,
      varopt: HttpTypes.StoreProductOptionValue
    ) => {
      acc[varopt.option?.title.toLowerCase() || ""] = varopt.value

      return acc
    },
    {}
  )
}

export const ProductDetailsHeader = ({
  product,
  locale,
  user,
  offers = [],
  seller,
}: {
  product: HttpTypes.StoreProduct
  locale: string
  user: HttpTypes.StoreCustomer | null
  offers?: StoreOffer[]
  seller?: SellerDTO
}) => {
  const t = useCopy()
  const { addToCart, onAddToCart, cart, isAddingItem } = useCartContext()
  const router = useRouter()
  const { allSearchParams } = useGetAllSearchParams()
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [isQuoteOpen, setIsQuoteOpen] = useState(false)

  const { cheapestVariant, cheapestPrice } = getProductPrice({
    product,
  })

  const hasAnyPrice = cheapestPrice !== null && cheapestVariant !== null

  const selectedVariant = hasAnyPrice
    ? {
        ...optionsAsKeymap(cheapestVariant.options ?? null),
        ...allSearchParams,
      }
    : allSearchParams

  const variantId =
    product.variants?.find(({ options }: { options: any }) =>
      options?.every((option: any) =>
        selectedVariant[option.option?.title.toLowerCase() || ""]?.includes(
          option.value
        )
      )
    )?.id || ""

  const { variantPrice } = getProductPrice({
    product,
    variantId,
  })

  // Buybox: the winning offer for the selected variant sets the price shown and
  // the offer that add-to-cart uses. Products are sold through offers, not the
  // variant's base price.
  const variantOffers = getVariantOffers(offers, variantId)
  const winnerOffer = getBuyboxWinner(variantOffers)
  const otherOffersCount = Math.max(variantOffers.length - 1, 0)

  const offerAmount = winnerOffer ? getOfferAmount(winnerOffer) : null
  const offerCurrency =
    winnerOffer?.calculated_price?.currency_code ||
    variantPrice?.currency_code ||
    "eur"
  const offerStock = winnerOffer ? getOfferStock(winnerOffer) : 0
  const hasOffer = !!winnerOffer && offerAmount !== null

  const displayPrice = hasOffer
    ? convertToLocale({ amount: offerAmount as number, currency_code: offerCurrency })
    : variantPrice?.calculated_price

  const quantityInCart =
    cart?.items?.find((item) => item.metadata?.offer_id === winnerOffer?.id)
      ?.quantity ?? 0
  const isStockMaxLimitReached = quantityInCart >= offerStock

  const isAddToCartDisabled =
    !hasOffer || !offerStock || isStockMaxLimitReached

  const handleAddToCart = async () => {
    if (!winnerOffer || isAddToCartDisabled) return

    const total = offerAmount as number
    const subtotal =
      winnerOffer.calculated_price?.calculated_amount_without_tax ?? total

    const storeCartLineItem = {
      thumbnail: product.thumbnail || "",
      product_title: product.title,
      quantity: 1,
      subtotal,
      total,
      tax_total: total - subtotal,
      variant_id: variantId,
      product_id: product.id,
      variant: product.variants?.find(({ id }) => id === variantId),
      metadata: { offer_id: winnerOffer.id },
    }

    onAddToCart(storeCartLineItem, offerCurrency)

    try {
      await addToCart({
        offerId: winnerOffer.id,
        quantity: 1,
        countryCode: locale,
      })
    } catch (error) {
      toast.error({
        title: t.addToCartError,
        description: t.addToCartErrorHint,
      })
    }
  }

  return (
    <div className="border rounded-sm p-5" data-testid="product-details-header">
      <div className="flex justify-between">
        <div>
          <h1 className="heading-lg text-primary" data-testid="product-title">{product.title}</h1>
          <div className="mt-2 flex flex-col gap-1" data-testid="product-price-container">
            {hasOffer ? (
              <span className="heading-md text-primary" data-testid="product-price-current">
                {displayPrice}
              </span>
            ) : hasAnyPrice && variantPrice ? (
              <span className="heading-md text-primary" data-testid="product-price-current">
                {variantPrice.calculated_price}
              </span>
            ) : (
              <span className="label-md text-secondary pt-2 pb-4" data-testid="product-price-unavailable">
                {t.notListedRegion}
              </span>
            )}
            {hasOffer && (
              <span className="label-sm text-secondary" data-testid="product-unit-price-hint">
                {t.bestUnitPrice(offerStock)}
              </span>
            )}
          </div>
        </div>
      </div>
      {hasAnyPrice && (
        <ProductVariants product={product} selectedVariant={selectedVariant} />
      )}
      <Button
        onClick={handleAddToCart}
        disabled={isAddToCartDisabled}
        loading={isAddingItem}
        className="w-full uppercase mb-4 py-3 flex justify-center"
        size="large"
        data-testid="product-add-to-cart-button"
      >
        {!hasOffer
          ? t.notListed
          : offerStock
          ? t.addToOrder
          : t.outOfStock}
      </Button>
      {seller && (
        <Button
          variant="tonal"
          onClick={() => {
            if (!user) {
              router.push("/login?sessionRequired=true")
              return
            }
            setIsQuoteOpen(true)
          }}
          className="w-full uppercase mb-4"
          data-testid="request-quote-button"
        >
          {t.requestQuote}
        </Button>
      )}
      {otherOffersCount > 0 && (
        <Button
          variant="tonal"
          onClick={() => setIsCompareOpen(true)}
          className="w-full uppercase mb-4"
          data-testid="compare-offers-button"
        >
          {t.compareOffers(otherOffersCount)}
        </Button>
      )}
      {isCompareOpen && (
        <CompareOffersModal
          offers={variantOffers}
          locale={locale}
          variantLabel={
            product.variants?.find(({ id }) => id === variantId)?.title ||
            undefined
          }
          onClose={() => setIsCompareOpen(false)}
        />
      )}
      {isQuoteOpen && user && seller && (
        <RequestQuoteModal
          productId={product.id}
          productTitle={product.title}
          sellerId={seller.id}
          offerId={winnerOffer?.id}
          variantId={variantId || null}
          user={user}
          onClose={() => setIsQuoteOpen(false)}
        />
      )}
      {user && seller && (
        <Chat
          user={user}
          seller={seller}
          buttonClassNames="w-full uppercase"
          product={product}
        />
      )}
    </div>
  )
}
