import FeaturedProducts from "@/modules/home/components/featured-products"
import Hero from "@/modules/home/components/hero"
import VendorDirectoryPreview from "@/modules/home/components/vendor-directory-preview"
import SkeletonFeaturedProducts from "@/modules/skeletons/templates/skeleton-featured-products"
import { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Tradnest | B2B marketplace",
  description:
    "Wholesale marketplace for company buyers. Source products from multiple vendors, request quotes, and manage approvals.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  return (
    <div className="flex flex-col gap-y-2 m-2">
      <Hero />
      <Suspense fallback={null}>
        <VendorDirectoryPreview />
      </Suspense>
      <Suspense fallback={<SkeletonFeaturedProducts />}>
        <FeaturedProducts countryCode={countryCode} />
      </Suspense>
    </div>
  )
}
