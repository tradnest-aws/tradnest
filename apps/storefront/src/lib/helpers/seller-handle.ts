/**
 * Next.js passes dynamic route params through `encodeURIComponent`.
 * Hebrew seller handles such as `מחסני-ברק` arrive as `%D7%9E...`.
 */
export function decodeSellerHandle(handle: string): string {
  let value = handle.trim()

  for (let i = 0; i < 2; i++) {
    if (!value.includes("%")) break
    try {
      const decoded = decodeURIComponent(value.replace(/\+/g, " "))
      if (decoded === value) break
      value = decoded
    } catch {
      break
    }
  }

  return value
}

export function normalizeSellerHandle(value: string): string {
  return decodeSellerHandle(value)
    .normalize("NFC")
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function sellerMatchesHandle(
  seller: { handle?: string | null; name?: string | null },
  handle: string
): boolean {
  const wanted = normalizeSellerHandle(handle)
  if (!wanted) return false
  if (seller.handle && normalizeSellerHandle(seller.handle) === wanted) {
    return true
  }
  if (seller.name && normalizeSellerHandle(seller.name) === wanted) {
    return true
  }
  return false
}
