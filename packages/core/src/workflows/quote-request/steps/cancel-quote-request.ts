import { MedusaError } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"
import { CancelQuoteRequestDTO, MercurModules } from "@mercurjs/types"

import QuoteRequestModuleService from "../../../modules/quote-request/service"

export const cancelQuoteRequestStep = createStep(
  "cancel-quote-request",
  async (input: CancelQuoteRequestDTO, { container }) => {
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
        "Only pending quote requests can be cancelled"
      )
    }

    const updated = await service.updateQuoteRequests({
      id: input.id,
      status: "cancelled",
    })

    return new StepResponse(updated, input.id)
  },
  async (quoteRequestId: string | undefined, { container }) => {
    if (!quoteRequestId) {
      return
    }
    const service = container.resolve<QuoteRequestModuleService>(
      MercurModules.QUOTE_REQUEST
    )
    await service.updateQuoteRequests({
      id: quoteRequestId,
      status: "pending",
    })
  }
)
