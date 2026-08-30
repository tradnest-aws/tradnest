import { listVendors } from "@/lib/data/vendors"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { Heading, Text } from "@medusajs/ui"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Vendors | Tradnest",
  description: "Browse wholesale vendors and their catalogs.",
}

export default async function VendorsPage() {
  const { vendors } = await listVendors().catch(() => ({ vendors: [] }))

  return (
    <div className="bg-neutral-100">
      <div className="content-container py-10 flex flex-col gap-6">
        <div>
          <Text className="text-xs uppercase tracking-widest text-neutral-500">
            Marketplace
          </Text>
          <Heading className="text-3xl">Vendors</Heading>
          <Text className="text-neutral-600 mt-2 max-w-2xl">
            Each supplier manages their own catalog. Company buyers can add
            items from multiple vendors, request quotes, and route orders
            through approval workflows.
          </Text>
        </div>
        {vendors.length ? (
          <ul className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-3 gap-3">
            {vendors.map((vendor) => (
              <li key={vendor.id}>
                <LocalizedClientLink
                  href={`/vendors/${vendor.handle}`}
                  className="block h-full bg-white p-6 rounded-lg shadow-borders-base hover:shadow-[0_0_0_4px_rgba(0,0,0,0.08)] transition-shadow"
                >
                  <Heading level="h2" className="text-xl">
                    {vendor.name}
                  </Heading>
                  <Text className="text-sm text-neutral-500 mt-1">
                    {vendor.handle}
                  </Text>
                  {vendor.description && (
                    <Text className="text-sm text-neutral-600 mt-3 line-clamp-3">
                      {vendor.description}
                    </Text>
                  )}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-white p-8 rounded-lg text-neutral-600">
            No vendors are listed yet. Create vendors in the admin dashboard and
            assign products to them.
          </div>
        )}
      </div>
    </div>
  )
}
