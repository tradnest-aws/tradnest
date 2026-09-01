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
  getOfferCurrency,
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
  const isLoggedIn = Boolean(user)

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
    product.variants?.find((variant) =>
      variant.options?.every((option) =>
        selectedVariant[option.option?.title.toLowerCase() || ""]?.includes(
          option.value
        )
      )
    )?.id || product.variants?.[0]?.id || ""

  const { variantPrice } = getProductPrice({
    product,
    variantId,
  })

  const variantOffers = variantId
    ? getVariantOffers(offers, variantId)
    : offers
  const rankedVariantOffers =
    variantOffers.length > 0 ? variantOffers : offers
  const winnerOffer = getBuyboxWinner(rankedVariantOffers)
  const otherOffersCount = Math.max(rankedVariantOffers.length - 1, 0)

  const offerAmount = winnerOffer ? getOfferAmount(winnerOffer) : null
  const offerCurrency = winnerOffer
    ? getOfferCurrency(
        winnerOffer,
        variantPrice?.currency_code || "ils"
      )
    : variantPrice?.currency_code || "ils"
  const offerStock = winnerOffer ? getOfferStock(winnerOffer) : 0
  const hasOffer = Boolean(winnerOffer)

  const displayPrice =
    offerAmount !== null
      ? convertToLocale({ amount: offerAmount, currency_code: offerCurrency })
      : variantPrice?.calculated_price

  const quantityInCart =
    cart?.items?.find((item) => item.metadata?.offer_id === winnerOffer?.id)
      ?.quantity ?? 0
  const isStockMaxLimitReached =
    offerStock !== Number.POSITIVE_INFINITY && quantityInCart >= offerStock

  const isAddToCartDisabled =
    !isLoggedIn || !hasOffer || !offerStock || isStockMaxLimitReached

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      router.push("/login?sessionRequired=true")
      return
    }
    if (!winnerOffer || isAddToCartDisabled) return

    const total = offerAmount ?? 0
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
    } catch {
      toast.error({
        title: t.addToCartError,
        description: t.addToCartErrorHint,
      })
    }
  }

  const addToCartLabel = !isLoggedIn
    ? t.loginToOrder
    : !hasOffer
      ? t.noOffers
      : offerStock
        ? t.addToOrder
        : t.outOfStock

  return (
    <div className="border border-primary/10 rounded-2xl p-6 bg-primary shadow-sm" data-testid="product-details-header">
      <div className="flex justify-between">
        <div>
          <h1 className="heading-lg text-primary" data-testid="product-title">{product.title}</h1>
          <div className="mt-2 flex flex-col gap-1" data-testid="product-price-container">
            {!isLoggedIn ? (
              <span className="label-md text-secondary pt-2 pb-4" data-testid="product-price-login">
                {t.loginToSeePrice}
              </span>
            ) : displayPrice ? (
              <span className="heading-md text-primary" data-testid="product-price-current">
                {displayPrice}
              </span>
            ) : hasOffer ? (
              <span className="label-md text-secondary pt-2 pb-4" data-testid="product-price-offer-only">
                {t.loginToSeePrice}
              </span>
            ) : (
              <span className="label-md text-secondary pt-2 pb-4" data-testid="product-price-unavailable">
                {t.noOffers}
              </span>
            )}
            {isLoggedIn && hasOffer && offerAmount !== null && (
              <span className="label-sm text-secondary" data-testid="product-unit-price-hint">
                {t.bestUnitPrice(offerStock)}
              </span>
            )}
          </div>
        </div>
      </div>
      {(hasAnyPrice || (product.variants?.length ?? 0) > 1) && (
        <ProductVariants product={product} selectedVariant={selectedVariant} />
      )}
      <Button
        onClick={handleAddToCart}
        disabled={isLoggedIn && isAddToCartDisabled}
        loading={isAddingItem}
        className="w-full mb-4 py-3 flex justify-center rounded-xl"
        size="large"
        data-testid="product-add-to-cart-button"
      >
        {addToCartLabel}
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
          className="w-full mb-4 rounded-xl"
          data-testid="request-quote-button"
        >
          {t.requestQuote}
        </Button>
      )}
      {otherOffersCount > 0 && (
        <Button
          variant="tonal"
          onClick={() => setIsCompareOpen(true)}
          className="w-full mb-4 rounded-xl"
          data-testid="compare-offers-button"
        >
          {t.compareOffers(otherOffersCount)}
        </Button>
      )}
      {isCompareOpen && (
        <CompareOffersModal
          offers={rankedVariantOffers}
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
          buttonClassNames="w-full rounded-xl"
          product={product}
        />
      )}
    </div>
  )
}
