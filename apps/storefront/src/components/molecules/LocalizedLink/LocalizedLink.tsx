"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { AnchorHTMLAttributes, ComponentProps } from "react"

import { DEFAULT_STOREFRONT_LOCALE } from "@/lib/i18n/copy"
import {
  isVendorPanelPath,
  localizeHref,
} from "@/lib/helpers/locale-path"

const LocalizedClientLink = ({
  children,
  href,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) => {
  const params = useParams()
  const localeParam = params?.locale
  const locale =
    (typeof localeParam === "string" ? localeParam : localeParam?.[0]) ||
    DEFAULT_STOREFRONT_LOCALE

  if (href.startsWith("http") || isVendorPanelPath(href)) {
    const anchorProps = props as AnchorHTMLAttributes<HTMLAnchorElement>
    return (
      <a href={href} {...anchorProps}>
        {children}
      </a>
    )
  }

  return (
    <Link href={localizeHref(href, locale)} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
