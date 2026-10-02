import { TradnestLogo } from "@/components/atoms/TradnestLogo/TradnestLogo"
import { HttpTypes } from "@medusajs/types"

import { CartDropdown, MobileNavbar, Navbar } from "@/components/cells"
import { UserDropdown } from "@/components/cells/UserDropdown/UserDropdown"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { MessageButton } from "@/components/molecules/MessageButton/MessageButton"
import { NavbarSearch } from "@/components/molecules/NavbarSearch/NavbarSearch"
import { listCategories } from "@/lib/data/categories"
import { retrieveCustomer } from "@/lib/data/customer"
import { SELLER_REGISTER_PATH } from "@/lib/helpers/locale-path"
import { getCopy } from "@/lib/i18n/copy"

export const Header = async ({ locale }: { locale: string }) => {
  const t = getCopy(locale)
  const user = await retrieveCustomer().catch(() => null)
  const isLoggedIn = Boolean(user)

  const { categories, parentCategories } = (await listCategories({
    query: { include_ancestors_tree: true },
  })) as {
    categories: HttpTypes.StoreProductCategory[]
    parentCategories: HttpTypes.StoreProductCategory[]
  }
  return (
    <header
      className="sticky top-0 z-50 bg-[rgb(var(--bg-primary))]/95 backdrop-blur-md border-b border-primary/8 shadow-[0_1px_0_rgba(16,24,40,0.04)]"
      data-testid="header"
    >
      <div
        className="storefront-shell flex items-center gap-3 lg:gap-6 py-3"
        data-testid="header-top"
      >
        <MobileNavbar
          parentCategories={parentCategories}
          categories={categories}
        />
        <LocalizedClientLink
          href="/"
          className="inline-flex shrink-0 items-center"
          data-testid="header-logo-link"
        >
          <TradnestLogo height={36} priority />
        </LocalizedClientLink>
        <div
          className="hidden md:block flex-1 max-w-xl"
          data-testid="header-search"
        >
          <NavbarSearch variant="header" />
        </div>
        <div
          className="ms-auto flex items-center justify-end gap-2 lg:gap-3"
          data-testid="header-actions"
        >
          <LocalizedClientLink
            href={SELLER_REGISTER_PATH}
            className="hidden lg:inline-flex items-center rounded-full border border-primary/15 px-4 py-2 label-md text-primary hover:bg-secondary transition-colors"
          >
            {t.becomeSupplier}
          </LocalizedClientLink>
          {!isLoggedIn && (
            <LocalizedClientLink
              href="/login"
              className="hidden sm:inline-flex items-center rounded-full bg-action text-white px-4 py-2 label-md font-semibold hover:bg-action-hover transition-colors"
            >
              {t.login}
            </LocalizedClientLink>
          )}
          {isLoggedIn && <MessageButton />}
          <UserDropdown isLoggedIn={isLoggedIn} />
          <CartDropdown />
        </div>
      </div>
      <Navbar categories={categories} parentCategories={parentCategories} />
    </header>
  )
}
