"use client"

import Image from "next/image"
import { Button } from "@/components/atoms"
import { HttpTypes } from "@medusajs/types"
import { cn } from "@/lib/utils"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { Product } from "@/types/product"
import { useCopy } from "@/lib/i18n/useCopy"
import { useSession } from "@/components/providers"

export const ProductCard = ({
  product,
  className,
}: {
  product: HttpTypes.StoreProduct | Product,
  className?: string
}) => {
  const t = useCopy()
  const { isLoggedIn } = useSession()
  if (!product) {
    return null
  }

  const { cheapestPrice } = getProductPrice({ product: product as HttpTypes.StoreProduct })

  const productName = String(product.title || t.productFallback)

  return (
    <div
      className={cn(
        "relative group border border-primary/10 rounded-2xl flex flex-col justify-between p-2 w-full lg:w-[calc(25%-1rem)] min-w-[250px] bg-primary shadow-sm hover:shadow-md transition-shadow",
        className
      )}
      data-testid="product-card"
      data-product-handle={product.handle}
    >
      <div className="relative w-full h-full bg-secondary aspect-square rounded-xl overflow-hidden" data-testid="product-card-image-container">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          aria-label={t.viewProduct(productName)}
          title={t.viewProduct(productName)}
          data-testid="product-card-link"
        >
          <div className="overflow-hidden w-full h-full flex justify-center align-center ">
            {product.thumbnail ? (
              <Image
                priority
                fetchPriority="high"
                src={decodeURIComponent(product.thumbnail)}
                alt={t.productImageAlt(productName)}
                width={100}
                height={100}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-contain aspect-square w-full object-center h-full lg:group-hover:scale-105 transition-all duration-300"
                data-testid="product-card-image"
              />
            ) : (
              <Image
                priority
                fetchPriority="high"
                src="/images/placeholder.svg"
                alt={t.productPlaceholderAlt(productName)}
                width={100}
                height={100}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                data-testid="product-card-placeholder-image"
              />
            )}
          </div>
        </LocalizedClientLink>
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          aria-label={t.seeMoreAbout(productName)}
          title={t.seeMoreAbout(productName)}
        >
          <Button className="absolute rounded-xl bg-action text-action-on-primary h-auto lg:h-[48px] lg:group-hover:block hidden w-[calc(100%-0.5rem)] mx-1 bottom-1 z-10" data-testid="product-card-see-more-button">
            {t.seeMore}
          </Button>
        </LocalizedClientLink>
      </div>
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        aria-label={t.goToProduct(productName)}
        title={t.goToProduct(productName)}
      >
        <div className="flex justify-between p-4" data-testid="product-card-info">
          <div className="w-full">
            <h3 className="heading-sm truncate" data-testid="product-card-title">{product.title}</h3>
            <div className="flex items-center gap-2 mt-2" data-testid="product-card-price">
              {isLoggedIn ? (
                <>
                  <p className="font-medium" data-testid="product-card-current-price">{cheapestPrice?.calculated_price}</p>
                  {cheapestPrice?.calculated_price !==
                    cheapestPrice?.original_price && (
                    <p className="text-sm text-gray-500 line-through" data-testid="product-card-original-price">
                      {cheapestPrice?.original_price}
                    </p>
                  )}
                </>
              ) : (
                <p className="label-md text-secondary" data-testid="product-card-login-price">
                  {t.loginToSeePrice}
                </p>
              )}
            </div>
          </div>
        </div>
      </LocalizedClientLink>
    </div>
  )
}
