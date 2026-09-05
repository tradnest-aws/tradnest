import { z } from "zod"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"

export type VendorGetQuoteRequestsParamsType = z.infer<
  typeof VendorGetQuoteRequestsParams
>
export const VendorGetQuoteRequestsParams = createFindParams({
  offset: 0,
  limit: 50,
}).extend({
  status: z
    .union([
      z.enum(["pending", "quoted", "accepted", "declined", "cancelled"]),
      z.array(
        z.enum(["pending", "quoted", "accepted", "declined", "cancelled"])
      ),
    ])
    .optional(),
})

export type VendorRespondQuoteRequestType = z.infer<
  typeof VendorRespondQuoteRequest
>
export const VendorRespondQuoteRequest = z
  .object({
    status: z.enum(["quoted", "declined"]),
    seller_note: z.string().max(2000).nullish(),
    quoted_unit_amount: z.coerce.number().int().min(0).nullish(),
  })
  .superRefine((value, ctx) => {
    if (value.status === "quoted" && value.quoted_unit_amount == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "quoted_unit_amount is required when sending a quote",
        path: ["quoted_unit_amount"],
      })
    }
  })
