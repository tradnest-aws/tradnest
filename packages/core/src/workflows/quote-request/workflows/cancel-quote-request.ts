import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { CancelQuoteRequestDTO } from "@mercurjs/types"

import { cancelQuoteRequestStep } from "../steps"

export const cancelQuoteRequestWorkflow = createWorkflow(
  {
    name: "cancel-quote-request",
  },
  function (input: CancelQuoteRequestDTO) {
    const quoteRequest = cancelQuoteRequestStep(input)

    return new WorkflowResponse(quoteRequest)
  }
)
