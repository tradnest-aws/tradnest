import { ReactNode } from "react"

import { cn } from "@/lib/utils"

export const HomeSnapRow = ({
  children,
  className,
  desktopClassName,
}: {
  children: ReactNode
  className?: string
  desktopClassName: string
}) => {
  return (
    <div
      className={cn(
        "flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 scrollbar-hide",
        "md:mx-0 md:px-0 md:pb-0 md:overflow-visible md:snap-none md:grid md:gap-4",
        desktopClassName,
        className
      )}
    >
      {children}
    </div>
  )
}
