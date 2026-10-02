export const SINGLE_SELLER_CART = "SINGLE_SELLER_CART"

type CartLine = {
  offer?: {
    seller?: { id?: string | null } | null
    seller_id?: string | null
  } | null
  metadata?: Record<string, unknown> | null
}

export function cartHasAnotherSeller(
  items: CartLine[] | null | undefined,
  incomingSellerId: string | null | undefined
): boolean {
  const incoming = incomingSellerId?.trim() ?? ""
  if (!incoming) return false

  return (items ?? []).some((item) => {
    const fromOffer =
      item.offer?.seller?.id || item.offer?.seller_id || ""
    const fromMeta = item.metadata?.seller_id
    const current =
      (typeof fromOffer === "string" && fromOffer.trim()) ||
      (typeof fromMeta === "string" && fromMeta.trim()) ||
      ""
    return current.length > 0 && current !== incoming
  })
}

export function isSingleSellerCartError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "")
  return message.includes(SINGLE_SELLER_CART)
}
