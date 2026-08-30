import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

import sellerQuoteRequest from "../../../links/seller-quote-request"

export const validateSellerQuoteRequest = async (
  scope: MedusaContainer,
  sellerId: string,
  quoteRequestId: string
) => {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [link],
  } = await query.graph({
    entity: sellerQuoteRequest.entryPoint,
    filters: {
      seller_id: sellerId,
      quote_request_id: quoteRequestId,
    },
    fields: ["seller_id", "quote_request_id"],
  })

  if (!link) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Quote request with id: ${quoteRequestId} was not found`
    )
  }
}
