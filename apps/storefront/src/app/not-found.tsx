import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ArrowUpIcon } from "@/icons"
import { Metadata } from "next"
import { headers } from "next/headers"
import { DEFAULT_STOREFRONT_LOCALE, getCopy } from "@/lib/i18n/copy"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export default async function NotFound() {
  const t = getCopy(
    (await headers()).get("x-locale") || DEFAULT_STOREFRONT_LOCALE
  )
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
