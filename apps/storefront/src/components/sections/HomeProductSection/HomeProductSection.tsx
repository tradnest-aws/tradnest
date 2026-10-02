import { HomeProductsCarousel } from "@/components/organisms"
import { Product } from "@/types/product"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getCopy } from "@/lib/i18n/copy"

export const HomeProductSection = async ({
  heading,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || "il",
  products = [],
  home = false,
}: {
  heading: string
  locale?: string
  products?: Product[]
  home?: boolean
}) => {
  const t = getCopy(locale)

  return (
    <section className="storefront-shell py-4 w-full">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="heading-lg font-bold tracking-tight text-primary">
          {heading}
        </h2>
        <LocalizedClientLink
          href="/categories"
          className="label-md font-semibold text-action hover:text-action-hover"
        >
          {t.seeAll}
        </LocalizedClientLink>
      </div>
      <HomeProductsCarousel
        locale={locale}
        sellerProducts={products.slice(0, 4)}
        home={home}
      />
    </section>
  )
}
