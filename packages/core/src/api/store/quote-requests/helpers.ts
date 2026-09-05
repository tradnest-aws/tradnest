import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

import customerQuoteRequest from "../../../links/customer-quote-request"

export const validateCustomerQuoteRequest = async (
  scope: MedusaContainer,
  customerId: string,
  quoteRequestId: string
) => {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [link],
  } = await query.graph({
    entity: customerQuoteRequest.entryPoint,
    filters: {
      customer_id: customerId,
      quote_request_id: quoteRequestId,
    },
    fields: ["customer_id", "quote_request_id"],
  })

  if (!link) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Quote request with id: ${quoteRequestId} was not found`
    )
  }
}
