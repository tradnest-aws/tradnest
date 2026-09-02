import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { cn } from "@/lib/utils"
import Image from "next/image"

export function CategoryCard({
  category,
  className,
}: {
  category: { name: string; handle: string; icon?: string | null }
  className?: string
}) {
  const iconSrc =
    category.icon || `/images/categories/${category.handle}.png`

  return (
    <LocalizedClientLink
      href={`/categories/${category.handle}`}
      className={cn(
        "group flex flex-col items-center gap-3 rounded-[24px] bg-primary border border-primary/10 px-4 py-6 hover:shadow-[0_12px_32px_rgba(16,24,40,0.08)] hover:-translate-y-0.5 transition-all",
        className
      )}
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
      <h3 className="w-full text-center label-lg text-primary">
        {category.name}
      </h3>
    </LocalizedClientLink>
  )
}
