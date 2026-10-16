import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { SellerOffersListing } from "@/components/sections/SellerOffersListing/SellerOffersListing"
import { PRODUCT_LIMIT } from "@/const"
import {
  AZTRADE_CATEGORY_TREE,
  type AztradeParentCategory,
  countOffersByCategory,
  offerMatchesCategory,
} from "@/lib/catalog/aztrade-categories"
import { listCatalogOffers } from "@/lib/data/seller-catalog"
import { retrieveCustomer } from "@/lib/data/customer"
import { getCopy } from "@/lib/i18n/copy"
import { cn } from "@/lib/utils"

export const CategoryCatalog = async ({
  parent = null,
  selected,
  locale,
  page = 1,
}: {
  parent?: AztradeParentCategory | null
  selected?: string | null
  locale: string
  page?: number
}) => {
  const t = getCopy(locale)
  const user = await retrieveCustomer().catch(() => null)
  const catalog = await listCatalogOffers({ countryCode: locale })
  const inScope = parent
    ? catalog.filter((offer) => offerMatchesCategory(offer.categoryHandles, parent.handle))
    : catalog
  const counts = countOffersByCategory(inScope)
  const filtered = selected
    ? inScope.filter((offer) => offerMatchesCategory(offer.categoryHandles, selected))
    : inScope
  const currentPage = Math.max(page, 1)
  const offset = (currentPage - 1) * PRODUCT_LIMIT
  const pageOffers = filtered.slice(offset, offset + PRODUCT_LIMIT)
  const sidebarItems = parent
    ? parent.children.filter((child) => (counts[child.handle] || 0) > 0)
    : AZTRADE_CATEGORY_TREE

  return (
    <div
      className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]"
      data-testid="category-catalog"
    >
      <aside data-testid="category-sidebar">
        <ul className="flex flex-col gap-1 rounded-[24px] border border-primary/10 bg-primary p-3">
          <li>
            <LocalizedClientLink
              href={parent ? `/categories/${parent.handle}` : "/categories"}
              className={cn(
                "label-md flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-primary hover:bg-secondary",
                !selected && "bg-secondary font-semibold text-action"
              )}
            >
              <span>{t.allProducts}</span>
              <span className="text-secondary">{inScope.length}</span>
            </LocalizedClientLink>
          </li>
          {sidebarItems.map((item) => (
              <li key={item.handle}>
                <LocalizedClientLink
                  href={`/categories/${item.handle}`}
                  className={cn(
                    "label-md flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-primary hover:bg-secondary",
                    selected === item.handle && "bg-secondary font-semibold text-action"
                  )}
                  data-testid={`category-sidebar-${item.handle}`}
                >
                  <span>{item.name}</span>
                  <span className="text-secondary">{counts[item.handle] || 0}</span>
                </LocalizedClientLink>
              </li>
            ))}
        </ul>
      </aside>
      <SellerOffersListing
        locale={locale}
        offers={pageOffers}
        count={filtered.length}
        sellerCard
        buyer={user}
      />
    </div>
  )
}
