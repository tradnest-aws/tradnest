"use server"

import { sdk } from "../client"
import type { StoreOffer } from "../helpers/buybox"
import { CACHE_TAGS, getGlobalCacheOptions } from "./cache-tags"
import { getAuthHeaders } from "./cookies"
import { listOffersResult } from "./offers"
import { getRegion } from "./regions"

const CATEGORY_FIELDS = "+product.categories.id,+product.categories.handle"
const PAGE_SIZE = 50

export type SellerCatalogOffer = StoreOffer & {
  categoryHandles: string[]
}

type ProductCategory = { handle?: string | null }
type ProductWithCategories = {
  id?: string
  categories?: ProductCategory[] | null
}

const categoryHandlesOnOffer = (offer: StoreOffer): string[] | undefined => {
  const product = offer.product as ProductWithCategories | undefined
  if (!product || !Object.prototype.hasOwnProperty.call(product, "categories")) {
    return undefined
  }
  if (!product.categories) return []
  return product.categories
    .map((category) => category.handle)
    .filter((handle): handle is string => Boolean(handle))
}

const collectOffers = async ({
  sellerId,
  countryCode,
  regionId,
  fieldsExtra,
}: {
  sellerId?: string
  countryCode?: string
  regionId?: string
  fieldsExtra?: string
}) => {
  const offers: StoreOffer[] = []
  let offset = 0

  for (let page = 0; page < 40; page += 1) {
    const result = await listOffersResult({
      sellerId,
      countryCode,
      regionId,
      limit: PAGE_SIZE,
      offset,
      fieldsExtra,
    })
    if (!result.ok) return { ok: false as const, offers: [] as StoreOffer[] }
    offers.push(...(result.offers as StoreOffer[]))
    offset += result.offers.length
    if (result.offers.length === 0 || offers.length >= result.count) break
  }

  return { ok: true as const, offers }
}

const loadProductCategories = async (productIds: string[]) => {
  const handles = new Map<string, string[]>()
  const headers = await getAuthHeaders()

  for (let index = 0; index < productIds.length; index += 20) {
    const chunk = productIds.slice(index, index + 20)
    if (!chunk.length) continue
    try {
      const { products } = (await (sdk.store.products.query({
        id: chunk,
        limit: chunk.length,
        fields: "id,*categories",
        fetchOptions: {
          headers: { ...headers },
          cache: "force-cache",
          next: getGlobalCacheOptions(CACHE_TAGS.products),
        },
      } as never) as unknown as Promise<{
        products?: ProductWithCategories[]
      }>))
      for (const product of products ?? []) {
        if (!product.id) continue
        handles.set(
          product.id,
          (product.categories ?? [])
            .map((category) => category.handle)
            .filter((handle): handle is string => Boolean(handle))
        )
      }
    } catch {
      continue
    }
  }

  return handles
}

const productIdOf = (offer: StoreOffer) =>
  offer.product_id || offer.product?.id || ""

const offersWithCategoryHandles = async ({
  sellerId,
  countryCode,
}: {
  sellerId?: string
  countryCode: string
}): Promise<SellerCatalogOffer[]> => {
  const region = countryCode ? await getRegion(countryCode) : null
  const regionId = region?.id
  const withCategories = await collectOffers({
    sellerId,
    countryCode,
    regionId,
    fieldsExtra: CATEGORY_FIELDS,
  })
  const categoriesLoaded =
    withCategories.ok &&
    withCategories.offers.every(
      (offer) => categoryHandlesOnOffer(offer) !== undefined
    )

  if (categoriesLoaded) {
    return withCategories.offers.map((offer) => ({
      ...offer,
      categoryHandles: categoryHandlesOnOffer(offer) ?? [],
    }))
  }

  const plain = withCategories.ok
    ? withCategories
    : await collectOffers({ sellerId, countryCode, regionId })
  const ids = [
    ...new Set(plain.offers.map(productIdOf).filter((id) => id.length > 0)),
  ]
  const byProduct = await loadProductCategories(ids)

  return plain.offers.map((offer) => ({
    ...offer,
    categoryHandles: byProduct.get(productIdOf(offer)) ?? [],
  }))
}

export const listSellerCatalogOffers = async ({
  sellerId,
  countryCode,
}: {
  sellerId: string
  countryCode: string
}): Promise<SellerCatalogOffer[]> =>
  offersWithCategoryHandles({ sellerId, countryCode })

export const listCatalogOffers = async ({
  countryCode,
}: {
  countryCode: string
}): Promise<SellerCatalogOffer[]> =>
  offersWithCategoryHandles({ countryCode })
