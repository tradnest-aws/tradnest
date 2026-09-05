import {
  authenticate,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework"
import {
  AuthenticatedMedusaRequest,
  maybeApplyLinkFilter,
  MedusaNextFunction,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MiddlewareRoute } from "@medusajs/medusa"

import customerQuoteRequest from "../../../links/customer-quote-request"
import { storeQuoteRequestQueryConfig } from "./query-config"
import {
  StoreCreateQuoteRequest,
  StoreGetQuoteRequestsParams,
} from "./validators"

const applyCustomerQuoteRequestLinkFilter = (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  req.filterableFields.customer_id = req.auth_context.actor_id

  return maybeApplyLinkFilter({
    entryPoint: customerQuoteRequest.entryPoint,
    resourceId: "quote_request_id",
    filterableField: "customer_id",
  })(req, res, next)
}

export const storeQuoteRequestsMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/store/quote-requests",
    middlewares: [
      authenticate("customer", ["session", "bearer"]),
      validateAndTransformQuery(
        StoreGetQuoteRequestsParams,
        storeQuoteRequestQueryConfig.list
      ),
      applyCustomerQuoteRequestLinkFilter,
    ],
  },
  {
    method: ["POST"],
    matcher: "/store/quote-requests",
    middlewares: [
      authenticate("customer", ["session", "bearer"]),
      validateAndTransformQuery(
        StoreGetQuoteRequestsParams,
        storeQuoteRequestQueryConfig.retrieve
      ),
      validateAndTransformBody(StoreCreateQuoteRequest),
    ],
  },
  {
    method: ["GET"],
    matcher: "/store/quote-requests/:id",
    middlewares: [
      authenticate("customer", ["session", "bearer"]),
      validateAndTransformQuery(
        StoreGetQuoteRequestsParams,
        storeQuoteRequestQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/store/quote-requests/:id",
    middlewares: [
      authenticate("customer", ["session", "bearer"]),
      validateAndTransformQuery(
        StoreGetQuoteRequestsParams,
        storeQuoteRequestQueryConfig.retrieve
      ),
    ],
  },
]
