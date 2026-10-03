/**
 * Vendor catalogs are private to the creating store, plus any product an admin
 * assigned to that store. An empty set must not match every product.
 */
export const sellerVisibleProductIds = (
  ownedIds: string[],
  assignedIds: string[]
): string[] => {
  const ids = Array.from(
    new Set([...ownedIds, ...assignedIds].filter((id) => Boolean(id)))
  )
  return ids.length ? ids : ["__none__"]
}
