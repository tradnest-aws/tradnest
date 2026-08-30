import { getVendor } from "@/lib/data/vendors"
import { getRegion } from "@/lib/data/regions"
import PaginatedProducts from "@/modules/store/templates/paginated-products"
import { Heading, Text } from "@medusajs/ui"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { handle } = await props.params
  const vendor = await getVendor(handle)

  if (!vendor) {
    return {
      title: "Vendor | Tradnest",
    }
  }

  return {
    title: `${vendor.name} | Tradnest`,
    description: vendor.description || `Wholesale catalog from ${vendor.name}`,
  }
}

export default async function VendorPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const vendor = await getVendor(params.handle)
  const region = await getRegion(params.countryCode)

  if (!vendor || !region) {
    notFound()
  }

  const productIds = vendor.products?.map((product) => product.id) || []
  const page = searchParams.page ? parseInt(searchParams.page) : 1

  return (
    <div className="bg-neutral-100">
      <div className="content-container py-10 flex flex-col gap-6">
        <div>
          <Text className="text-xs uppercase tracking-widest text-neutral-500">
            Vendor catalog
          </Text>
          <Heading className="text-3xl">{vendor.name}</Heading>
          {vendor.description && (
            <Text className="text-neutral-600 mt-2 max-w-2xl">
              {vendor.description}
            </Text>
          )}
        </div>
        {productIds.length ? (
          <PaginatedProducts
            page={page}
            countryCode={params.countryCode}
            productsIds={productIds}
          />
        ) : (
          <div className="bg-white p-8 rounded-lg text-neutral-600">
            This vendor has no products assigned yet.
          </div>
        )}
      </div>
    </div>
  )
}
