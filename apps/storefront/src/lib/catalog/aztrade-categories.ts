import tree from "./aztrade-categories.json"

export type AztradeChildCategory = {
  name: string
  handle: string
}

export type AztradeParentCategory = {
  name: string
  handle: string
  icon: string
  children: AztradeChildCategory[]
}

export const AZTRADE_CATEGORY_TREE: AztradeParentCategory[] = tree.map(
  (parent) => ({
    name: parent.name,
    handle: parent.handle,
    icon: `/images/categories/${parent.handle}.jpg`,
    children: parent.children,
  })
)

export const findAztradeCategory = (handle: string) => {
  for (const parent of AZTRADE_CATEGORY_TREE) {
    if (parent.handle === handle) {
      return { parent, child: null as AztradeChildCategory | null }
    }
    const child = parent.children.find((item) => item.handle === handle)
    if (child) return { parent, child }
  }
  return null
}

/** Parent matches offers in the parent or any of its children. Unknown handles match nothing. */
export const offerMatchesCategory = (
  categoryHandles: string[],
  selected: string | null | undefined
) => {
  if (!selected) return true
  const found = findAztradeCategory(selected)
  if (!found) return false
  if (found.child) return categoryHandles.includes(found.child.handle)
  const childHandles = found.parent.children.map((child) => child.handle)
  return (
    categoryHandles.includes(found.parent.handle) ||
    childHandles.some((handle) => categoryHandles.includes(handle))
  )
}

export const countOffersByCategory = (
  offers: { categoryHandles: string[] }[]
) => {
  const counts: Record<string, number> = {}
  for (const parent of AZTRADE_CATEGORY_TREE) {
    counts[parent.handle] = offers.filter((offer) =>
      offerMatchesCategory(offer.categoryHandles, parent.handle)
    ).length
    for (const child of parent.children) {
      counts[child.handle] = offers.filter((offer) =>
        offer.categoryHandles.includes(child.handle)
      ).length
    }
  }
  return counts
}
