import { MedusaError } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"
import { MercurModules, RespondQuoteRequestDTO } from "@mercurjs/types"

import QuoteRequestModuleService from "../../../modules/quote-request/service"

export const respondQuoteRequestStep = createStep(
  "respond-quote-request",
  async (input: RespondQuoteRequestDTO, { container }) => {
    const service = container.resolve<QuoteRequestModuleService>(
      MercurModules.QUOTE_REQUEST
    )

    const [quoteRequest] = await service.listQuoteRequests({ id: input.id })

    if (!quoteRequest) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Quote request not found"
      )
    }

    if (quoteRequest.status !== "pending") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Only pending quote requests can be answered"
      )
    }

    const updated = await service.updateQuoteRequests({
      id: input.id,
      status: input.status,
      seller_note: input.seller_note ?? null,
      quoted_unit_amount: input.quoted_unit_amount ?? null,
    })

    return new StepResponse(updated, {
      id: input.id,
      status: quoteRequest.status,
      seller_note: quoteRequest.seller_note,
      quoted_unit_amount: quoteRequest.quoted_unit_amount,
    })
  },
  async (prev, { container }) => {
    if (!prev) {
      return
    }
    const service = container.resolve<QuoteRequestModuleService>(
      MercurModules.QUOTE_REQUEST
    )
    await service.updateQuoteRequests({
      id: prev.id,
      status: prev.status,
      seller_note: prev.seller_note,
      quoted_unit_amount: prev.quoted_unit_amount,
    })
  }
)
