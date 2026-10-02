import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { StoreQuoteRequestResponse } from "@mercurjs/types"

import { cancelQuoteRequestWorkflow } from "../../../../workflows/quote-request/workflows"
import { validateCustomerQuoteRequest } from "../helpers"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<StoreQuoteRequestResponse>
) => {
  const { id } = req.params

  await validateCustomerQuoteRequest(
    req.scope,
    req.auth_context.actor_id,
    id!
  )

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
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<StoreQuoteRequestResponse>
) => {
  const { id } = req.params

  await validateCustomerQuoteRequest(
    req.scope,
    req.auth_context.actor_id,
    id!
  )

  await cancelQuoteRequestWorkflow.run({
    container: req.scope,
    input: { id: id! },
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
