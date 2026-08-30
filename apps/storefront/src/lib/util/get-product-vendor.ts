import { StoreProductWithVendor, StoreVendor } from "@/types"

export const getProductVendor = (
  product?: StoreProductWithVendor | { vendor?: StoreVendor | StoreVendor[] | null }
) => {
  const vendor = product?.vendor
  if (!vendor) {
    return null
  }

  return Array.isArray(vendor) ? vendor[0] || null : vendor
}
