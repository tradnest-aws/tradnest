import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"
import { Link } from "@medusajs/framework/modules-sdk"
import { CreateQuoteRequestDTO, MercurModules } from "@mercurjs/types"

import QuoteRequestModuleService from "../../../modules/quote-request/service"

export const createQuoteRequestStep = createStep(
  "create-quote-request",
  async (input: CreateQuoteRequestDTO, { container }) => {
    const service = container.resolve<QuoteRequestModuleService>(
      MercurModules.QUOTE_REQUEST
    )
    const link = container.resolve<Link>(ContainerRegistrationKeys.LINK)

    const quoteRequest = await service.createQuoteRequests({
      quantity: input.quantity,
      message: input.message ?? null,
      target_delivery: input.target_delivery ?? null,
      company_name: input.company_name ?? null,
      product_id: input.product_id,
      product_title: input.product_title ?? null,
      offer_id: input.offer_id ?? null,
      variant_id: input.variant_id ?? null,
      status: "pending",
    })

    await link.create([
      {
        [Modules.CUSTOMER]: {
          customer_id: input.customer_id,
        },
        [MercurModules.QUOTE_REQUEST]: {
          quote_request_id: quoteRequest.id,
        },
      },
      {
        [MercurModules.SELLER]: {
          seller_id: input.seller_id,
        },
        [MercurModules.QUOTE_REQUEST]: {
          quote_request_id: quoteRequest.id,
        },
      },
    ])

    return new StepResponse(quoteRequest, quoteRequest.id)
  },
  async (quoteRequestId: string | undefined, { container }) => {
    if (!quoteRequestId) {
      return
    }
    const service = container.resolve<QuoteRequestModuleService>(
      MercurModules.QUOTE_REQUEST
    )
    await service.deleteQuoteRequests(quoteRequestId)
  }
)
