import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"
import { ProductChangeActionType } from "@mercurjs/types"

export { sellerVisibleProductIds } from "./seller-visible-products"

export const getSellerOwnedProductIds = async (
  scope: MedusaContainer,
  sellerId: string
): Promise<string[]> => {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: actions } = await query.graph({
    entity: "product_change_action",
    fields: ["product_id"],
    filters: {
      action: ProductChangeActionType.PRODUCT_ADD,
      product_change: { created_by: sellerId },
    },
  })

  return actions
    .map(action => action.product_id)
    .filter((id): id is string => Boolean(id))
}

/** Products an admin explicitly assigned to this store via `product_seller`. */
export const getSellerAssignedProductIds = async (
  scope: MedusaContainer,
  sellerId: string
): Promise<string[]> => {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: links } = await query.graph({
    entity: "product_seller",
    fields: ["product_id"],
    filters: { seller_id: sellerId },
  })

  return (links as { product_id: string | null }[])
    .map((link) => link.product_id)
    .filter((id): id is string => Boolean(id))
}

export const ensureSellerOwnsProduct = async (
  scope: MedusaContainer,
  sellerId: string,
  productIds: string[]
): Promise<void> => {
  if (!productIds.length) {
    return
  }

  const query = scope.resolve(ContainerRegistrationKeys.QUERY)

  // A seller may manage a product it is assigned to (product_seller eligibility)
  // OR a product it created (master-product authoring).
  const { data } = await query.graph({
    entity: "product_seller",
    fields: ["product_id"],
    filters: {
      seller_id: sellerId,
      product_id: productIds,
    },
  })

  const ownedProductIds = new Set<string | null>(
    data.map(({ product_id }) => product_id)
  )
  for (const id of await getSellerOwnedProductIds(scope, sellerId)) {
    ownedProductIds.add(id)
  }
  const missingProductId = productIds.find((id) => !ownedProductIds.has(id))

  if (missingProductId) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Product with id ${missingProductId} was not found`
    )
  }
}

/** A store may offer only on variants of products it created or was assigned. */
export const ensureSellerOwnsOfferVariants = async (
  scope: MedusaContainer,
  sellerId: string,
  variantIds: string[]
): Promise<void> => {
  const unique = Array.from(new Set(variantIds.filter(Boolean)))
  if (!unique.length) {
    return
  }

  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "product.id"],
    filters: { id: unique },
  })

  const byId = new Map(
    (
      variants as { id: string; product?: { id?: string | null } | null }[]
    ).map((variant) => [variant.id, variant])
  )

  const productIds = unique.map((id) => {
    const productId = byId.get(id)?.product?.id
    if (!productId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Variant with id ${id} was not found`
      )
    }
    return productId
  })

  await ensureSellerOwnsProduct(scope, sellerId, productIds)
}
