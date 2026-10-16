import { OfferCard, ProductsPagination } from "@/components/organisms"
import { ProductListingNoResultsView } from "@/components/molecules"
import { PRODUCT_LIMIT } from "@/const"
import { listOffers } from "@/lib/data/offers"
import type { StoreOffer } from "@/lib/helpers/buybox"
import { getCopy } from "@/lib/i18n/copy"
import { HttpTypes } from "@medusajs/types"

export const SellerOffersListing = async ({
  seller_id,
  locale,
  page = 1,
  offers: providedOffers,
  count: providedCount,
  sellerCard = false,
  buyer = null,
}: {
  seller_id?: string
  locale: string
  page?: number
  offers?: StoreOffer[]
  count?: number
  sellerCard?: boolean
  buyer?: HttpTypes.StoreCustomer | null
}) => {
  const currentPage = Math.max(page, 1)
  const offset = (currentPage - 1) * PRODUCT_LIMIT

  const loaded =
    providedOffers
      ? { offers: providedOffers, count: providedCount ?? providedOffers.length }
      : await listOffers({
          sellerId: seller_id,
          countryCode: locale,
          limit: PRODUCT_LIMIT,
          offset,
        })

  const { offers, count } = loaded
  const pages = Math.ceil(count / PRODUCT_LIMIT) || 1
  const t = getCopy(locale)

  return (
    <div className="py-4" data-testid="seller-offers-listing">
      <div className="my-4 label-md">{t.listingsCount(count)}</div>
      {(sellerCard ? count === 0 : offers.length === 0) ? (
        sellerCard ? (
          <p className="my-10 text-center label-md text-secondary" data-testid="seller-offers-empty">
            {t.sellerEmptyOffers}
          </p>
        ) : (
          <ProductListingNoResultsView />
        )
      ) : (
        <>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            data-testid="seller-offers-list"
          >
            {(offers as StoreOffer[]).map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                locale={locale}
                className="w-full lg:w-full min-w-0"
                sellerPage={sellerCard}
                buyer={buyer}
              />
            ))}
          </div>
          <ProductsPagination pages={pages} />
        </>
      )}
    </div>
  )
}
