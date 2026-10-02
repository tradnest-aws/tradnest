import { HttpTypes } from "@medusajs/types"
import { CategoryNavbar, NavbarSearch } from "@/components/molecules"
import { ParentCategoryLinks } from "@/components/molecules/ParentCategoryLinks/ParentCategoryLinks"

export const Navbar = ({
  categories,
  parentCategories,
}: {
  categories: HttpTypes.StoreProductCategory[]
  parentCategories: HttpTypes.StoreProductCategory[]
}) => {
  return (
    <div
      className="border-t border-primary/8 bg-primary"
      data-testid="navbar"
    >
      <div className="storefront-shell hidden lg:flex items-center justify-between gap-6 py-2.5">
        <ParentCategoryLinks
          parentCategories={parentCategories}
          categories={categories}
        />
        <CategoryNavbar
          categories={categories}
          parentCategories={parentCategories}
        />
      </div>
      <div
        className="storefront-shell md:hidden py-3"
        data-testid="navbar-search-mobile"
      >
        <NavbarSearch variant="header" />
      </div>
    </div>
  )
}
