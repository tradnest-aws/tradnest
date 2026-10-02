import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"
import { defaultStoreCartFields, refetchCart } from "../../helpers"
import { cartHasAnotherSeller, SINGLE_SELLER_CART } from "../../single-seller-cart"
import { StoreAddCartLineItemType } from "./validators"

export const POST = async (
  req: MedusaRequest<StoreAddCartLineItemType>,
  res: MedusaResponse,
) => {
  const cart_id = req.params.id
  const { additional_data, metadata, offer_id, ...item } = req.validatedBody

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: offers } = await query.graph({
    entity: "offer",
    fields: ["id", "variant_id", "seller_id"],
    filters: { id: offer_id },
  })

  const offer = offers[0] as
    | { id: string; variant_id: string; seller_id?: string | null }
    | undefined
  if (!offer) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Offer ${offer_id} not found`,
    )
  }

  const { data: carts } = await query.graph({
    entity: "cart",
    fields: ["items.metadata", "items.offer.seller_id"],
    filters: { id: cart_id },
  })
  const existingItems =
    (
      carts[0] as
        | {
            items?: Array<{
              metadata?: Record<string, unknown> | null
              offer?: { seller_id?: string | null } | null
            }>
          }
        | undefined
    )?.items ?? []

  const sellerIds = existingItems.flatMap((line) =>
    line.offer?.seller_id ? [line.offer.seller_id] : []
  )
  const offerIds = existingItems.flatMap((line) => {
    const id = line.metadata?.offer_id
    return typeof id === "string" && id.length > 0 ? [id] : []
  })
  if (offerIds.length) {
    const { data: existingOffers } = await query.graph({
      entity: "offer",
      fields: ["seller_id"],
      filters: { id: offerIds },
    })
    for (const row of existingOffers as Array<{ seller_id?: string | null }>) {
      if (row.seller_id) sellerIds.push(row.seller_id)
    }
  }

  if (cartHasAnotherSeller(sellerIds, offer.seller_id)) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, SINGLE_SELLER_CART)
  }

  await addToCartWorkflow(req.scope).run({
    input: {
      cart_id,
      items: [
        {
          ...item,
          variant_id: offer.variant_id,
          offer_id,
          requires_shipping: true,
          metadata: {
            ...(metadata ?? {}),
            offer_id,
            seller_id: offer.seller_id,
          },
        },
      ],
      additional_data,
    },
  })

  const cart = await refetchCart(cart_id, req.scope, defaultStoreCartFields)
  res.status(200).json({ cart })
}
