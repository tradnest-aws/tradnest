import { defineLink } from "@medusajs/framework/utils"

import SellerModule from "../modules/seller"
import QuoteRequestModule from "../modules/quote-request"

export default defineLink(SellerModule.linkable.seller, {
  linkable: QuoteRequestModule.linkable.quoteRequest,
  isList: true,
})
