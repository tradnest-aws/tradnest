"use client"

import { useCopy } from "@/lib/i18n/useCopy"

export function HomeStats() {
  const t = useCopy()
  const stats = [
    { value: t.statProductsValue, label: t.statProductsLabel },
    { value: t.statSuppliersValue, label: t.statSuppliersLabel },
    { value: t.statDeliveryValue, label: t.statDeliveryLabel },
  ]

  return (
    <section className="storefront-shell" data-testid="home-stats">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-secondary storefront-card overflow-hidden">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-primary px-6 py-6 text-center">
            <p className="text-3xl font-extrabold text-primary tracking-tight">
              {stat.value}
            </p>
            <p className="label-md text-secondary mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
