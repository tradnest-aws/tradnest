import { SellerAvatar } from "@/components/cells/SellerAvatar/SellerAvatar"
import { SellerReviewList } from "@/components/molecules"
import { SellerCartStrip } from "@/components/molecules/SellerCartStrip/SellerCartStrip"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { SellerOffersListing } from "@/components/sections/SellerOffersListing/SellerOffersListing"
import { PRODUCT_LIMIT } from "@/const"
import {
  AZTRADE_CATEGORY_TREE,
  countOffersByCategory,
  offerMatchesCategory,
} from "@/lib/catalog/aztrade-categories"
import { listSellerCatalogOffers } from "@/lib/data/seller-catalog"
import { listSellerReviews } from "@/lib/data/seller"
import { getCopy } from "@/lib/i18n/copy"
import { cn } from "@/lib/utils"
import type { SingleProductReview } from "@/types/product"
import { HttpTypes } from "@medusajs/types"
import { SellerDTO } from "@mercurjs/types"

const sellerHref = (
  handle: string,
  params: Record<string, string | undefined>
) => {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value)
  }
  const query = search.toString()
  return `/sellers/${handle}${query ? `?${query}` : ""}`
}

const contactOf = (seller: SellerDTO) => {
  const address = seller.address
  const addressLine = [
    address?.address_1,
    address?.address_2,
    address?.city,
    address?.postal_code,
  ]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(", ")
  const phone = seller.phone || address?.phone || ""
  return {
    phone: phone.trim(),
    email: (seller.email || "").trim(),
    website: (seller.website_url || "").trim(),
    addressLine,
  }
}

export const SellerStorefront = async ({
  seller,
  locale,
  user,
  page = 1,
  tab = "products",
  category,
}: {
  seller: SellerDTO
  locale: string
  user: HttpTypes.StoreCustomer | null
  page?: number
  tab?: string
  category?: string
}) => {
  const t = getCopy(locale)
  const activeTab = tab === "reviews" || tab === "about" ? tab : "products"
  const currentPage = Math.max(page, 1)
  const [catalog, reviewRecords] = await Promise.all([
    listSellerCatalogOffers({ sellerId: seller.id, countryCode: locale }),
    listSellerReviews(seller.id),
  ])
  const counts = countOffersByCategory(catalog)
  const filtered = category
    ? catalog.filter((offer) => offerMatchesCategory(offer.categoryHandles, category))
    : catalog
  const offset = (currentPage - 1) * PRODUCT_LIMIT
  const pageOffers = filtered.slice(offset, offset + PRODUCT_LIMIT)
  const contact = contactOf(seller)
  const hasContact = Boolean(
    contact.phone || contact.email || contact.website || contact.addressLine
  )
  const reviews: SingleProductReview[] = reviewRecords.map((review) => ({
    id: review.id,
    rating: Number(review.rating) || 0,
    username: "",
    created_at: review.created_at || new Date(0).toISOString(),
    customer: {
      first_name: review.customer?.first_name || "",
      last_name: review.customer?.last_name || "",
    },
    customer_note: review.customer_note || "",
    image: "",
    seller_note: review.seller_note || undefined,
    updated_at: review.updated_at || review.created_at || new Date(0).toISOString(),
    seller,
  }))

  const tabs = [
    {
      id: "products",
      label: t.sellerProductsTab(catalog.length),
      href: sellerHref(seller.handle, { category }),
    },
    {
      id: "reviews",
      label: t.sellerReviewsTab,
      href: sellerHref(seller.handle, { tab: "reviews" }),
    },
    {
      id: "about",
      label: t.sellerAboutTab,
      href: sellerHref(seller.handle, { tab: "about" }),
    },
  ]

  return (
    <div data-testid="seller-storefront">
      <header className="flex flex-col gap-4 rounded-[24px] border border-primary/10 bg-primary p-5 sm:flex-row sm:items-start">
        <SellerAvatar photo={seller.logo || ""} size={80} alt={seller.name} />
        <div className="min-w-0 flex-1">
          <h1 className="heading-lg text-primary">{seller.name}</h1>
          {seller.description ? (
            <div
              className="mt-2 label-md text-secondary whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: seller.description }}
            />
          ) : null}
          {hasContact ? (
            <ul className="mt-3 flex flex-col gap-1 label-md text-primary">
              {contact.phone ? (
                <li>
                  <a href={`tel:${contact.phone}`} className="hover:text-action">
                    {contact.phone}
                  </a>
                </li>
              ) : null}
              {contact.email ? (
                <li>
                  <a href={`mailto:${contact.email}`} className="hover:text-action">
                    {contact.email}
                  </a>
                </li>
              ) : null}
              {contact.website ? (
                <li>
                  <a
                    href={contact.website}
                    className="hover:text-action"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {contact.website}
                  </a>
                </li>
              ) : null}
              {contact.addressLine ? <li>{contact.addressLine}</li> : null}
            </ul>
          ) : null}
        </div>
      </header>

      <nav
        className="mt-6 flex gap-2 overflow-x-auto border-b border-primary/10"
        aria-label={seller.name}
      >
        {tabs.map((item) => (
          <LocalizedClientLink
            key={item.id}
            href={item.href}
            className={cn(
              "label-md whitespace-nowrap px-4 py-3 font-semibold text-secondary",
              activeTab === item.id && "border-b-2 border-action text-action"
            )}
            data-testid={`seller-tab-${item.id}`}
          >
            {item.label}
          </LocalizedClientLink>
        ))}
      </nav>

      {activeTab === "reviews" ? (
        <div className="py-6" data-testid="seller-reviews">
          {reviews.length ? (
            <SellerReviewList reviews={reviews} />
          ) : (
            <p className="label-md text-secondary">{t.sellerNoReviews}</p>
          )}
        </div>
      ) : null}

      {activeTab === "about" ? (
        <div className="py-6" data-testid="seller-about">
          {seller.description ? (
            <div
              className="label-md text-primary whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: seller.description }}
            />
          ) : (
            <p className="label-md text-secondary">{t.sellerNoDescription}</p>
          )}
          <p className="mt-4 label-md font-semibold text-primary">
            {t.sellerOfferCount(catalog.length)}
          </p>
        </div>
      ) : null}

      {activeTab === "products" ? (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside data-testid="seller-category-nav">
            <ul className="flex flex-col gap-1 rounded-[24px] border border-primary/10 bg-primary p-3">
              <li>
                <LocalizedClientLink
                  href={sellerHref(seller.handle, {})}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl px-3 py-2 label-md text-primary hover:bg-secondary",
                    !category && "bg-secondary font-semibold text-action"
                  )}
                >
                  <span>{t.allProducts}</span>
                  <span className="text-secondary">{catalog.length}</span>
                </LocalizedClientLink>
              </li>
              {AZTRADE_CATEGORY_TREE.filter(
                (parent) => (counts[parent.handle] || 0) > 0
              ).map((parent) => (
                <li key={parent.handle}>
                  <LocalizedClientLink
                    href={sellerHref(seller.handle, { category: parent.handle })}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl px-3 py-2 label-md text-primary hover:bg-secondary",
                      category === parent.handle && "bg-secondary font-semibold text-action"
                    )}
                  >
                    <span>{parent.name}</span>
                    <span className="text-secondary">{counts[parent.handle]}</span>
                  </LocalizedClientLink>
                  <ul className="mt-1 mb-2 flex flex-col">
                    {parent.children
                      .filter((child) => (counts[child.handle] || 0) > 0)
                      .map((child) => (
                        <li key={child.handle}>
                          <LocalizedClientLink
                            href={sellerHref(seller.handle, {
                              category: child.handle,
                            })}
                            className={cn(
                              "flex items-center justify-between gap-3 rounded-xl px-3 py-1.5 label-sm text-secondary hover:bg-secondary hover:text-primary",
                              category === child.handle &&
                                "bg-secondary font-semibold text-action"
                            )}
                          >
                            <span>{child.name}</span>
                            <span>{counts[child.handle]}</span>
                          </LocalizedClientLink>
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
            </ul>
          </aside>
          <div>
            <SellerCartStrip sellerId={seller.id} />
            <SellerOffersListing
              locale={locale}
              offers={pageOffers}
              count={filtered.length}
              sellerCard
              buyer={user}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
