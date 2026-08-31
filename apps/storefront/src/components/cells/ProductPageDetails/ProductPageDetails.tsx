import { ProductPageAccordion } from "@/components/molecules"
import { headers } from "next/headers"
import { DEFAULT_STOREFRONT_LOCALE, getCopy } from "@/lib/i18n/copy"

export const ProductPageDetails = async ({ details }: { details: string }) => {
  if (!details) return null
  const locale =
    (await headers()).get("x-locale") || DEFAULT_STOREFRONT_LOCALE
  const t = getCopy(locale)

  return (
    <ProductPageAccordion heading={t.productDetails} defaultOpen={false} data-testid="product-details-section">
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
