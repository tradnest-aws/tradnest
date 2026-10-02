export const SINGLE_SELLER_CART = "SINGLE_SELLER_CART"

export function cartHasAnotherSeller(
  existingSellerIds: Array<string | null | undefined>,
  incomingSellerId: string | null | undefined
): boolean {
  const incoming = incomingSellerId?.trim() ?? ""
  if (!incoming) return false

  return existingSellerIds.some((id) => {
    const current = typeof id === "string" ? id.trim() : ""
    return current.length > 0 && current !== incoming
  })
}
