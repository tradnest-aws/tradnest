export type StoreVendor = {
  id: string
  handle: string
  name: string
  description?: string | null
  email?: string | null
  phone?: string | null
  logo?: string | null
  status?: "pending" | "active" | "inactive"
  products?: { id: string }[]
}

export type StoreVendorsResponse = {
  vendors: StoreVendor[]
  count: number
  offset: number
  limit: number
}

export type StoreVendorResponse = {
  vendor: StoreVendor
}
