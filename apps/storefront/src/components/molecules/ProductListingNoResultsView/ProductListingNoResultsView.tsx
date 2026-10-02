"use client"

import { useCopy } from "@/lib/i18n/useCopy"

const ProductListingNoResultsView = () => {
  const t = useCopy()
  return (
    <div className="text-center w-full my-10" data-testid="product-listing-no-results-view">
      <h2 className="text-primary heading-lg">{t.noResults}</h2>
      <p className="mt-4 text-lg">
        {t.noResultsHint}
      </p>
    </div>
  )
}

export default ProductListingNoResultsView
