import { Carousel } from "@/components/cells"
import { CategoryCard } from "@/components/organisms"

export const categories: { id: number; name: string; handle: string }[] = [
  { id: 1, name: "אריזות", handle: "packaging" },
  { id: 2, name: "מזון סיטונאי", handle: "food" },
  { id: 3, name: "חומרי בניין", handle: "building" },
  { id: 4, name: "ציוד משרדי", handle: "office" },
  { id: 5, name: "ניקיון תעשייתי", handle: "cleaning" },
]

export const HomeCategories = async ({ heading }: { heading: string }) => {
  return (
    <section className="bg-primary py-8 w-full">
      <div className="mb-6">
        <h2 className="heading-lg text-primary uppercase">{heading}</h2>
      </div>
      <Carousel
        items={categories?.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      />
    </section>
  )
}
