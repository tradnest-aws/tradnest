"use client"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ArrowRightIcon } from "@/icons"
import { useCopy } from "@/lib/i18n/useCopy"

export function HowProcurementWorksSection() {
  const t = useCopy()
  const steps = [
    { title: t.how1Title, body: t.how1Body },
    { title: t.how2Title, body: t.how2Body },
    { title: t.how3Title, body: t.how3Body },
  ]

  return (
    <section className="container" data-testid="how-procurement-works">
      <h2 className="heading-lg text-primary mb-8">{t.howTitle}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <div key={step.title} className="border border-primary/10 rounded-2xl p-6 bg-primary shadow-sm">
            <p className="label-sm text-secondary mb-3">0{index + 1}</p>
            <h3 className="heading-md mb-3">{step.title}</h3>
            <p className="label-md text-secondary">{step.body}</p>
          </div>
        ))}
      </div>
      <LocalizedClientLink
        href="/register"
        className="inline-flex items-center gap-2 mt-8 heading-sm"
        data-testid="how-procurement-register-link"
      >
        {t.howRegister}
        <ArrowRightIcon className="rtl-flip" />
      </LocalizedClientLink>
    </section>
  )
}
