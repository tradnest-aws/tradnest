import { CategoryCard } from "@/components/organisms"
import { HomeSnapRow } from "@/components/cells"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { AZTRADE_CATEGORY_TREE } from "@/lib/catalog/aztrade-categories"
import { getCopy } from "@/lib/i18n/copy"

export const categories = AZTRADE_CATEGORY_TREE.map((category, index) => ({
  id: index + 1,
  name: category.name,
  handle: category.handle,
}))

export const HomeCategories = async ({
  heading,
  locale,
}: {
  heading: string
  locale: string
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
      <HomeSnapRow desktopClassName="md:grid-cols-3 lg:grid-cols-5">
        {AZTRADE_CATEGORY_TREE.map((category) => (
          <CategoryCard
            key={category.handle}
            category={category}
            className="max-md:w-[42vw] max-md:min-w-[148px] max-md:snap-start max-md:shrink-0"
          />
        ))}
      </HomeSnapRow>
    </section>
  )
}
