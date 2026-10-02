"use client"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import footerLinks from "@/data/footerLinks"
import { useCopy } from "@/lib/i18n/useCopy"
import { TradnestLogo } from "@/components/atoms/TradnestLogo/TradnestLogo"

export function Footer() {
  const t = useCopy()

  return (
    <footer
      className="mt-12 bg-[rgb(var(--bg-tertiary))] text-white"
      data-testid="footer"
    >
      <div className="storefront-shell grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-12">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <TradnestLogo markOnly height={36} />
            <span className="heading-sm font-bold tracking-tight text-white">
              Tradnest
            </span>
          </div>
          <p className="label-md text-white/80 max-w-xs">{t.homeDescription}</p>
        </div>
        <div data-testid="footer-customer-services">
          <h2 className="heading-sm mb-4 text-white">{t.buyerServices}</h2>
          <nav className="space-y-3" aria-label={t.customerServicesNav}>
            {footerLinks.customerServices.map(({ key, path }) => (
              <LocalizedClientLink
                key={key}
                href={path}
                className="block label-md text-white/90 hover:text-white"
                data-testid={`footer-link-${key}`}
              >
                {t[key]}
              </LocalizedClientLink>
            ))}
          </nav>
        </div>
        <div data-testid="footer-about">
          <h2 className="heading-sm mb-4 text-white">{t.about}</h2>
          <nav className="space-y-3" aria-label={t.aboutNav}>
            {footerLinks.about.map(({ key, path }) => (
              <LocalizedClientLink
                key={key}
                href={path}
                className="block label-md text-white/90 hover:text-white"
                data-testid={`footer-link-${key}`}
              >
                {t[key]}
              </LocalizedClientLink>
            ))}
          </nav>
        </div>
        <div data-testid="footer-connect">
          <h2 className="heading-sm mb-4 text-white">{t.connect}</h2>
          <nav className="space-y-3" aria-label={t.socialNav}>
            {footerLinks.connect.map(({ label, path }) => (
              <a
                aria-label={t.goToSocial(label)}
                title={t.goToSocial(label)}
                key={label}
                href={path}
                className="block label-md text-white/90 hover:text-white"
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
        className="storefront-shell border-t border-white/15 py-6"
        data-testid="footer-copyright"
      >
        <p className="text-md text-white/70 text-center">{t.copyright}</p>
      </div>
    </footer>
  )
}
