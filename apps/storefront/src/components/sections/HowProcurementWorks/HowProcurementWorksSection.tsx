import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ArrowRightIcon } from "@/icons"
import { headers } from "next/headers"
import { DEFAULT_STOREFRONT_LOCALE, getCopy } from "@/lib/i18n/copy"

export async function HowProcurementWorksSection() {
  const locale =
    (await headers()).get("x-locale") || DEFAULT_STOREFRONT_LOCALE
  const t = getCopy(locale)
  const steps = [
    { title: t.how1Title, body: t.how1Body },
    { title: t.how2Title, body: t.how2Body },
    { title: t.how3Title, body: t.how3Body },
  ]

  return (
    <section className="bg-primary container" data-testid="how-procurement-works">
      <h2 className="heading-lg text-primary mb-8 uppercase">{t.howTitle}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="border rounded-sm p-6">
            <p className="label-sm text-secondary mb-3">0{index + 1}</p>
            <h3 className="heading-md mb-3">{step.title}</h3>
            <p className="label-md text-secondary">{step.body}</p>
          </div>
        ))}
      </div>
      <LocalizedClientLink
        href="/register"
        className="inline-flex items-center gap-2 mt-8 heading-sm uppercase"
        data-testid="how-procurement-register-link"
      >
        {t.howRegister}
        <ArrowRightIcon className="rtl-flip" />
      </LocalizedClientLink>
    </section>
  )
}
