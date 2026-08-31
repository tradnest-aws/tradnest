"use client"

import { ProductPageAccordion } from "@/components/molecules"
import { useCopy } from "@/lib/i18n/useCopy"

export const ProductPageDetails = ({ details }: { details: string }) => {
  const t = useCopy()
  if (!details) return null

  return (
    <ProductPageAccordion
      heading={t.productDetails}
      defaultOpen={false}
      data-testid="product-details-section"
    >
      <div
        className="product-details"
        dangerouslySetInnerHTML={{
          __html: details,
        }}
        data-testid="product-details-content"
      />
    </ProductPageAccordion>
  )
}
