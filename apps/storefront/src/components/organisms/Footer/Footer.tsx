"use client"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import footerLinks from "@/data/footerLinks"
import { useCopy } from "@/lib/i18n/useCopy"

export function Footer() {
  const t = useCopy()

  return (
    <footer className="bg-secondary mt-8" data-testid="footer">
      <div className="container grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-primary border border-primary/10" data-testid="footer-customer-services">
          <h2 className="heading-sm text-primary mb-3">
            {t.buyerServices}
          </h2>
          <nav className="space-y-3" aria-label={t.customerServicesNav}>
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

        <div className="p-6 rounded-2xl bg-primary border border-primary/10" data-testid="footer-about">
          <h2 className="heading-sm text-primary mb-3">{t.about}</h2>
          <nav className="space-y-3" aria-label={t.aboutNav}>
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

        <div className="p-6 rounded-2xl bg-primary border border-primary/10" data-testid="footer-connect">
          <h2 className="heading-sm text-primary mb-3">{t.connect}</h2>
          <nav className="space-y-3" aria-label={t.socialNav}>
            {footerLinks.connect.map(({ label, path }) => (
              <a
                aria-label={t.goToSocial(label)}
                title={t.goToSocial(label)}
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

      <div className="container py-6" data-testid="footer-copyright">
        <p className="text-md text-secondary text-center">{t.copyright}</p>
      </div>
    </footer>
  )
}
