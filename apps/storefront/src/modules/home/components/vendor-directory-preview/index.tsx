import { listVendors } from "@/lib/data/vendors"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { Heading, Text } from "@medusajs/ui"

export default async function VendorDirectoryPreview() {
  const { vendors } = await listVendors().catch(() => ({ vendors: [] }))

  if (!vendors.length) {
    return null
  }

  return (
    <section className="content-container py-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <Text className="text-xs uppercase tracking-widest text-brand-gold">
            Suppliers
          </Text>
          <Heading level="h2" className="text-2xl">
            Shop by vendor
          </Heading>
        </div>
        <LocalizedClientLink
          href="/vendors"
          className="text-sm text-brand-navy hover:text-brand-gold"
        >
          All vendors
        </LocalizedClientLink>
      </div>
      <ul className="grid grid-cols-1 small:grid-cols-3 gap-3">
        {vendors.slice(0, 6).map((vendor) => (
          <li key={vendor.id}>
            <LocalizedClientLink
              href={`/vendors/${vendor.handle}`}
              className="block bg-white p-6 rounded-lg shadow-borders-base hover:shadow-[0_0_0_4px_rgba(0,0,0,0.08)] transition-shadow"
            >
              <Text className="text-xs text-neutral-500 uppercase mb-2">
                Vendor
              </Text>
              <Heading level="h3" className="text-xl">
                {vendor.name}
              </Heading>
              {vendor.description && (
                <Text className="text-sm text-neutral-600 mt-2 line-clamp-2">
                  {vendor.description}
                </Text>
              )}
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </section>
  )
}
