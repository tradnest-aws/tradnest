import { Carousel } from "@/components/cells"
import { CategoryCard } from "@/components/organisms"

export const categories: { id: number; name: string; handle: string }[] = [
  {
    id: 1,
    name: "Raw materials",
    handle: "raw-materials",
  },
  {
    id: 2,
    name: "Packaging",
    handle: "packaging",
  },
  {
    id: 3,
    name: "MRO",
    handle: "mro",
  },
  {
    id: 4,
    name: "Electronics",
    handle: "electronics",
  },
  {
    id: 5,
    name: "Safety",
    handle: "safety",
  },
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
