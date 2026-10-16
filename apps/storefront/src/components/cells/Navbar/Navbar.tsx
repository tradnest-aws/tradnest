import { NavbarSearch } from "@/components/molecules"
import { ParentCategoryLinks } from "@/components/molecules/ParentCategoryLinks/ParentCategoryLinks"
import { countOffersByCategory } from "@/lib/catalog/aztrade-categories"
import { listCatalogOffers } from "@/lib/data/seller-catalog"

export const Navbar = async ({ locale }: { locale: string }) => {
  const offers = await listCatalogOffers({ countryCode: locale }).catch(() => [])
  const counts = countOffersByCategory(offers)

  return (
    <div className="border-t border-primary/8 bg-primary" data-testid="navbar">
      <div className="storefront-shell py-2">
        <ParentCategoryLinks counts={counts} />
      </div>
      <div
        className="storefront-shell pb-3 md:hidden"
        data-testid="navbar-search-mobile"
      >
        <NavbarSearch variant="header" />
      </div>
    </div>
  )
}
