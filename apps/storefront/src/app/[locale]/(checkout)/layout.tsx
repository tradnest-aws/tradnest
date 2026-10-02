import { Button } from "@/components/atoms"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { CollapseIcon } from "@/icons"
import { TradnestLogo } from "@/components/atoms/TradnestLogo/TradnestLogo"
import { headers } from "next/headers"
import { DEFAULT_STOREFRONT_LOCALE, getCopy } from "@/lib/i18n/copy"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const t = getCopy(
    (await headers()).get("x-locale") || DEFAULT_STOREFRONT_LOCALE
  )
  return (
    <>
      <header>
        <div className="relative w-full py-2 lg:px-8 px-4">
          <div className="absolute top-3">
            <LocalizedClientLink href="/cart">
              <Button variant="tonal" className="flex items-center gap-2">
                <CollapseIcon className="rotate-90" />
                <span className="hidden lg:block">{t.backToCart}</span>
              </Button>
            </LocalizedClientLink>
          </div>
          <div className="flex items-center justify-center ps-4 lg:ps-0 w-full">
            <LocalizedClientLink href="/" className="inline-flex items-center">
              <TradnestLogo height={36} priority />
            </LocalizedClientLink>
          </div>
        </div>
      </header>
      {children}
    </>
  )
}
