import { headers } from "next/headers"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import footerLinks from "@/data/footerLinks"
import { DEFAULT_STOREFRONT_LOCALE, getCopy } from "@/lib/i18n/copy"

export async function Footer() {
  const locale =
    (await headers()).get("x-locale") || DEFAULT_STOREFRONT_LOCALE
  const t = getCopy(locale)

  return (
    <footer className="bg-primary container" data-testid="footer">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="p-6 border rounded-sm" data-testid="footer-customer-services">
          <h2 className="heading-sm text-primary mb-3 uppercase">
            {t.buyerServices}
          </h2>
          <nav className="space-y-3" aria-label="Customer services navigation">
            {footerLinks.customerServices.map(({ key, path }) => (
              <LocalizedClientLink
                key={key}
                href={path}
                className="block label-md"
                data-testid={`footer-link-${key}`}
              >
                {t[key]}
              </LocalizedClientLink>
            ))}
          </nav>
        </div>

        <div className="p-6 border rounded-sm" data-testid="footer-about">
          <h2 className="heading-sm text-primary mb-3 uppercase">{t.about}</h2>
          <nav className="space-y-3" aria-label="About navigation">
            {footerLinks.about.map(({ key, path }) => (
              <LocalizedClientLink
                key={key}
                href={path}
                className="block label-md"
                data-testid={`footer-link-${key}`}
              >
                {t[key]}
              </LocalizedClientLink>
            ))}
          </nav>
        </div>

        <div className="p-6 border rounded-sm" data-testid="footer-connect">
          <h2 className="heading-sm text-primary mb-3 uppercase">{t.connect}</h2>
          <nav className="space-y-3" aria-label="Social media navigation">
            {footerLinks.connect.map(({ label, path }) => (
              <a
                aria-label={`Go to ${label} page`}
                title={`Go to ${label} page`}
                key={label}
                href={path}
                className="block label-md"
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`footer-link-${label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="py-6 border rounded-sm " data-testid="footer-copyright">
        <p className="text-md text-secondary text-center ">© 2026 Tradnest</p>
      </div>
    </footer>
  )
}
