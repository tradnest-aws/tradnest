import { DEFAULT_STOREFRONT_LOCALE } from "@/lib/i18n/copy"

export const JOIN_AS_SELLER_PATH = "/join-as-seller"

export const isDefaultStorefrontLocale = (locale: string) =>
  locale.toLowerCase() === DEFAULT_STOREFRONT_LOCALE.toLowerCase()

export const localizeHref = (href: string, locale: string): string => {
  if (
    !href ||
    href.startsWith("http") ||
    href.startsWith("#") ||
    href.startsWith("mailto:")
  ) {
    return href
  }

  const path = href.startsWith("/") ? href : `/${href}`
  if (isDefaultStorefrontLocale(locale)) {
    return path
  }

  return `/${locale}${path}`
}

export const publicPageUrl = (
  baseUrl: string,
  locale: string,
  path: string
): string => {
  const normalized =
    !path || path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`
  const loc = localizeHref(normalized, locale)
  if (loc === "/") {
    return baseUrl
  }
  return `${baseUrl}${loc}`
}
