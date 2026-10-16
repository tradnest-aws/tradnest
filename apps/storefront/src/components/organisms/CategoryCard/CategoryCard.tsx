import Image from "next/image"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { cn } from "@/lib/utils"

export function CategoryCard({
  category,
  className,
}: {
  category: { name: string; handle: string; icon?: string | null }
  className?: string
}) {
  const iconSrc = category.icon || `/images/categories/${category.handle}.png`

  return (
    <LocalizedClientLink
      href={`/categories/${category.handle}`}
      className={cn(
        "flex flex-col items-center gap-3 rounded-[24px] border border-primary/10 bg-primary px-4 py-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(28,26,41,0.08)]",
        className
      )}
      data-testid={`home-category-${category.handle}`}
    >
      <div className="relative size-24 overflow-hidden rounded-full bg-secondary">
        <Image
          loading="lazy"
          src={iconSrc}
          alt=""
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
      <h3 className="label-lg w-full text-center text-primary">{category.name}</h3>
    </LocalizedClientLink>
  )
}
