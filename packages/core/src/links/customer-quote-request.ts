import { defineLink } from "@medusajs/framework/utils"
import CustomerModule from "@medusajs/medusa/customer"

import QuoteRequestModule from "../modules/quote-request"

export default defineLink(CustomerModule.linkable.customer, {
  linkable: QuoteRequestModule.linkable.quoteRequest,
  isList: true,
})
