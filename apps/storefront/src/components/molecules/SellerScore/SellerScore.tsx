"use client"

import { StarRating } from "@/components/atoms"
import { useCopy } from "@/lib/i18n/useCopy"

export const SellerScore = ({
  rate,
  reviewCount,
}: {
  rate: number
  reviewCount: number
}) => {
  const t = useCopy()
  return (
    <div className="flex items-center flex-col label-md h-full py-12">
      <h3 className="heading-sm mb-2">{t.sellerScore}</h3>
      <div className="flex gap-2 items-center mb-4 text-secondary">
        <StarRating rate={rate} starSize={16} /> {rate.toFixed(1)}
      </div>
      <p className="text-secondary">{t.reviewsCount(reviewCount)}</p>
    </div>
  )
}
