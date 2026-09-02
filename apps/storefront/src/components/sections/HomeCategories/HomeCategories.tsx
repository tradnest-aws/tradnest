import { CategoryCard } from "@/components/organisms"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getCopy } from "@/lib/i18n/copy"

export const categories: { id: number; name: string; handle: string }[] = [
  { id: 1, name: "אריזות", handle: "packaging" },
  { id: 2, name: "מזון סיטונאי", handle: "food" },
  { id: 3, name: "חומרי בניין", handle: "building" },
  { id: 4, name: "ציוד משרדי", handle: "office" },
  { id: 5, name: "ניקיון תעשייתי", handle: "cleaning" },
]

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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  )
}
