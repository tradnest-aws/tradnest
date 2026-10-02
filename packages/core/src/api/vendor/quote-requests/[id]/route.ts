import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { VendorQuoteRequestResponse } from "@mercurjs/types"

import { respondQuoteRequestWorkflow } from "../../../../workflows/quote-request/workflows"
import { validateSellerQuoteRequest } from "../helpers"
import { VendorRespondQuoteRequestType } from "../validators"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<VendorQuoteRequestResponse>
) => {
  const { id } = req.params

  await validateSellerQuoteRequest(req.scope, req.seller_context!.seller_id, id!)

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [quote_request],
  } = await query.graph({
    entity: "quote_request",
    fields: req.queryConfig.fields,
    filters: {
      id,
    },
  })

  res.json({ quote_request })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<VendorRespondQuoteRequestType>,
  res: MedusaResponse<VendorQuoteRequestResponse>
) => {
  const { id } = req.params

  await validateSellerQuoteRequest(req.scope, req.seller_context!.seller_id, id!)

  await respondQuoteRequestWorkflow.run({
    container: req.scope,
    input: {
      id: id!,
      status: req.validatedBody.status,
      seller_note: req.validatedBody.seller_note ?? null,
      quoted_unit_amount: req.validatedBody.quoted_unit_amount ?? null,
    },
  })

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [quote_request],
  } = await query.graph({
    entity: "quote_request",
    fields: req.queryConfig.fields,
    filters: {
      id,
    },
  })

  res.json({ quote_request })
}
