"use client"

import { ProductPageAccordion } from "@/components/molecules"
import { useCopy } from "@/lib/i18n/useCopy"

export const ProductDetailsShipping = () => {
  const t = useCopy()

  return (
    <ProductPageAccordion heading={t.shippingReturns} defaultOpen={false}>
      <div className="product-details">
        <ul>
          <li>{t.shippingReturnsBody}</li>
        </ul>
      </div>
    </ProductPageAccordion>
  )
}
