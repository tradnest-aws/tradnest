import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  StoreQuoteRequestListResponse,
  StoreQuoteRequestResponse,
} from "@mercurjs/types"

import { createQuoteRequestWorkflow } from "../../../workflows/quote-request/workflows"
import {
  StoreCreateQuoteRequestType,
  StoreGetQuoteRequestsParamsType,
} from "./validators"

export const POST = async (
  req: AuthenticatedMedusaRequest<StoreCreateQuoteRequestType>,
  res: MedusaResponse<StoreQuoteRequestResponse>
) => {
  const { result } = await createQuoteRequestWorkflow.run({
    container: req.scope,
    input: {
      ...req.validatedBody,
      customer_id: req.auth_context.actor_id,
    },
  })

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [quote_request],
  } = await query.graph({
    entity: "quote_request",
    fields: req.queryConfig.fields,
    filters: {
      id: result.id,
    },
  })

  res.status(201).json({ quote_request })
}

export const GET = async (
  req: AuthenticatedMedusaRequest<StoreGetQuoteRequestsParamsType>,
  res: MedusaResponse<StoreQuoteRequestListResponse>
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: quote_requests, metadata } = await query.graph({
    entity: "quote_request",
    fields: req.queryConfig.fields,
    filters: req.filterableFields,
    pagination: req.queryConfig.pagination,
  })

  res.json({
    quote_requests,
    count: metadata?.count ?? 0,
    offset: metadata?.skip ?? 0,
    limit: metadata?.take ?? 0,
  })
}
