"use client"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import footerLinks from "@/data/footerLinks"
import { useCopy } from "@/lib/i18n/useCopy"
import { TradnestLogo } from "@/components/atoms/TradnestLogo/TradnestLogo"

export function Footer() {
  const t = useCopy()

  return (
    <footer className="bg-tertiary text-tertiary mt-12" data-testid="footer">
      <div className="storefront-shell grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-12">
        <div>
          <div className="mb-4">
            <TradnestLogo height={36} />
          </div>
          <p className="label-md text-tertiary/70 max-w-xs">{t.homeDescription}</p>
        </div>
        <div data-testid="footer-customer-services">
          <h2 className="heading-sm mb-4">{t.buyerServices}</h2>
          <nav className="space-y-3" aria-label={t.customerServicesNav}>
            {footerLinks.customerServices.map(({ key, path }) => (
              <LocalizedClientLink
                key={key}
                href={path}
                className="block label-md text-tertiary/80 hover:text-tertiary"
                data-testid={`footer-link-${key}`}
              >
                {t[key]}
              </LocalizedClientLink>
            ))}
          </nav>
        </div>
        <div data-testid="footer-about">
          <h2 className="heading-sm mb-4">{t.about}</h2>
          <nav className="space-y-3" aria-label={t.aboutNav}>
            {footerLinks.about.map(({ key, path }) => (
              <LocalizedClientLink
                key={key}
                href={path}
                className="block label-md text-tertiary/80 hover:text-tertiary"
                data-testid={`footer-link-${key}`}
              >
                {t[key]}
              </LocalizedClientLink>
            ))}
          </nav>
        </div>
        <div data-testid="footer-connect">
          <h2 className="heading-sm mb-4">{t.connect}</h2>
          <nav className="space-y-3" aria-label={t.socialNav}>
            {footerLinks.connect.map(({ label, path }) => (
              <a
                aria-label={t.goToSocial(label)}
                title={t.goToSocial(label)}
                key={label}
                href={path}
                className="block label-md text-tertiary/80 hover:text-tertiary"
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`footer-link-${label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>
      <div
        className="storefront-shell border-t border-tertiary/15 py-6"
        data-testid="footer-copyright"
      >
        <p className="text-md text-tertiary/60 text-center">{t.copyright}</p>
      </div>
    </footer>
  )
}
