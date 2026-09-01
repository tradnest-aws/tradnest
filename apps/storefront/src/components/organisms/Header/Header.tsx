import { TradnestLogo } from "@/components/atoms/TradnestLogo/TradnestLogo"
import { HttpTypes } from "@medusajs/types"

import { CartDropdown, MobileNavbar, Navbar } from "@/components/cells"
import { UserDropdown } from "@/components/cells/UserDropdown/UserDropdown"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { MessageButton } from "@/components/molecules/MessageButton/MessageButton"
import { listCategories } from "@/lib/data/categories"
import { retrieveCustomer } from "@/lib/data/customer"
import { ParentCategoryLinks } from "@/components/molecules/ParentCategoryLinks/ParentCategoryLinks"
import { JOIN_AS_SELLER_PATH } from "@/lib/helpers/locale-path"
import { getCopy } from "@/lib/i18n/copy"

export const Header = async ({ locale } : {
  locale: string
}) => {
  const t = getCopy(locale)
  const user = await retrieveCustomer().catch(() => null)
  const isLoggedIn = Boolean(user)

  const { categories, parentCategories } = (await listCategories({ query: { include_ancestors_tree: true } })) as {
    categories: HttpTypes.StoreProductCategory[]
    parentCategories: HttpTypes.StoreProductCategory[]
  }
  return (
    <header
      className="sticky top-0 z-50 bg-primary/95 backdrop-blur border-b border-primary/10"
      data-testid="header"
    >
      <div className="flex py-3 lg:px-8 px-4 md:px-5" data-testid="header-top">
        <div className="flex items-center lg:w-1/3">
          <MobileNavbar
            parentCategories={parentCategories}
            categories={categories}
          />
          <ParentCategoryLinks
            parentCategories={parentCategories}
            categories={categories}
          />
        </div>
        <div className="flex lg:justify-center lg:w-1/3 items-center ps-4 lg:ps-0">
          <LocalizedClientLink href="/" className="inline-flex items-center" data-testid="header-logo-link">
            <TradnestLogo height={40} priority />
          </LocalizedClientLink>
        </div>
        <div className="flex items-center justify-end gap-2 lg:gap-4 w-full lg:w-1/3 py-2" data-testid="header-actions">
          <LocalizedClientLink
            href={JOIN_AS_SELLER_PATH}
            className="hidden md:inline-flex label-md text-primary hover:text-action"
          >
            {t.becomeSupplier}
          </LocalizedClientLink>
          {isLoggedIn && <MessageButton />}
          <UserDropdown isLoggedIn={isLoggedIn} />
          <CartDropdown />
        </div>
      </div>
      <Navbar categories={categories} parentCategories={parentCategories} />
    </header>
  )
}
