"use client"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { useCopy } from "@/lib/i18n/useCopy"

export function HowProcurementWorksSection() {
  const t = useCopy()
  const steps = [
    { title: t.how1Title, body: t.how1Body },
    { title: t.how2Title, body: t.how2Body },
    { title: t.how3Title, body: t.how3Body },
  ]

  return (
    <section className="storefront-shell" data-testid="how-procurement-works">
      <div className="storefront-card p-6 lg:p-10">
        <h2 className="heading-lg font-bold tracking-tight text-primary mb-8">
          {t.howTitle}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              <p className="text-4xl font-extrabold text-[rgba(var(--brand-100),1)] mb-3">
                0{index + 1}
              </p>
              <h3 className="heading-md mb-3 text-primary">{step.title}</h3>
              <p className="label-md text-secondary">{step.body}</p>
            </div>
          ))}
        </div>
        <LocalizedClientLink
          href="/register"
          className="inline-flex items-center mt-8 rounded-full bg-action text-action-on-primary px-6 py-3 font-semibold hover:bg-action-hover"
          data-testid="how-procurement-register-link"
        >
          {t.howRegister}
        </LocalizedClientLink>
      </div>
    </section>
  )
}
