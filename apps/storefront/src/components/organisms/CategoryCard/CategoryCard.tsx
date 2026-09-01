import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import Image from "next/image"

export function CategoryCard({
  category,
}: {
  category: { name: string; handle: string; icon?: string | null }
}) {
  const iconSrc =
    category.icon || `/images/categories/${category.handle}.png`

  return (
    <LocalizedClientLink
      href={`/categories/${category.handle}`}
      className="relative flex flex-col items-center border border-primary/10 rounded-2xl bg-component transition-all hover:shadow-md w-[233px] aspect-square"
    >
      <div className="flex relative aspect-square overflow-hidden w-[200px]">
        <Image
          loading="lazy"
          src={iconSrc}
          alt=""
          width={200}
          height={200}
          sizes="(min-width: 1024px) 200px, 40vw"
          className="object-cover scale-90 rounded-full"
        />
      </div>
      <h3 className="w-full text-center label-lg text-primary">
        {category.name}
      </h3>
    </LocalizedClientLink>
  )
}
