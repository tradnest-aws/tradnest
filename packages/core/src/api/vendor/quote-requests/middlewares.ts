import { PolicyResource } from "../../utils/policy-resources"
import { PolicyOperation } from "@medusajs/framework/utils"
import {
  AuthenticatedMedusaRequest,
  maybeApplyLinkFilter,
  MedusaNextFunction,
  MedusaResponse,
  MiddlewareRoute,
} from "@medusajs/framework/http"
import {
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework"

import sellerQuoteRequest from "../../../links/seller-quote-request"
import { vendorQuoteRequestQueryConfig } from "./query-config"
import {
  VendorGetQuoteRequestsParams,
  VendorRespondQuoteRequest,
} from "./validators"

const applySellerQuoteRequestLinkFilter = (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  req.filterableFields.seller_id = req.seller_context!.seller_id

  return maybeApplyLinkFilter({
    entryPoint: sellerQuoteRequest.entryPoint,
    resourceId: "quote_request_id",
    filterableField: "seller_id",
  })(req, res, next)
}

export const vendorQuoteRequestsMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/vendor/quote-requests",
    middlewares: [
      validateAndTransformQuery(
        VendorGetQuoteRequestsParams,
        vendorQuoteRequestQueryConfig.list
      ),
      applySellerQuoteRequestLinkFilter,
    ],
    policies: [
      {
        resource: PolicyResource.quote_request,
        operation: PolicyOperation.read,
      },
    ],
  },
  {
    method: ["GET"],
    matcher: "/vendor/quote-requests/:id",
    middlewares: [
      validateAndTransformQuery(
        VendorGetQuoteRequestsParams,
        vendorQuoteRequestQueryConfig.retrieve
      ),
    ],
    policies: [
      {
        resource: PolicyResource.quote_request,
        operation: PolicyOperation.read,
      },
    ],
  },
  {
    method: ["POST"],
    matcher: "/vendor/quote-requests/:id",
    middlewares: [
      validateAndTransformQuery(
        VendorGetQuoteRequestsParams,
        vendorQuoteRequestQueryConfig.retrieve
      ),
      validateAndTransformBody(VendorRespondQuoteRequest),
    ],
    policies: [
      {
        resource: PolicyResource.quote_request,
        operation: PolicyOperation.update,
      },
    ],
  },
]
