import { z } from "zod"

import { createFindParams } from "@medusajs/medusa/api/utils/validators"

export type StoreGetQuoteRequestsParamsType = z.infer<
  typeof StoreGetQuoteRequestsParams
>
export const StoreGetQuoteRequestsParams = createFindParams({
  offset: 0,
  limit: 50,
})

export type StoreCreateQuoteRequestType = z.infer<typeof StoreCreateQuoteRequest>
export const StoreCreateQuoteRequest = z.object({
  seller_id: z.string().min(1),
  product_id: z.string().min(1),
  product_title: z.string().max(200).nullish(),
  offer_id: z.string().nullish(),
  variant_id: z.string().nullish(),
  quantity: z.coerce.number().int().min(1).max(1_000_000),
  message: z.string().max(2000).nullish(),
  target_delivery: z.string().max(120).nullish(),
  company_name: z.string().max(120).nullish(),
})
