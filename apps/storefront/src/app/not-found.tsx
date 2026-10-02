"use client"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ArrowUpIcon } from "@/icons"
import { useCopy } from "@/lib/i18n/useCopy"

export default function NotFound() {
  const t = useCopy()
  return (
    <div className="flex flex-col gap-4 items-center justify-center py-24">
      <h1 className="text-2xl-semi text-ui-fg-base">{t.notFoundTitle}</h1>
      <p className="text-small-regular text-ui-fg-base">
        {t.notFoundBody}
      </p>
      <LocalizedClientLink className="flex gap-x-1 items-center group" href="/">
        {t.goHome}
        <ArrowUpIcon
          className="group-hover:rotate-45 ease-in-out duration-150 rtl-flip"
          color="var(--fg-interactive)"
        />
      </LocalizedClientLink>
    </div>
  )
}
