import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { RespondQuoteRequestDTO } from "@mercurjs/types"

import { respondQuoteRequestStep } from "../steps"

export const respondQuoteRequestWorkflow = createWorkflow(
  {
    name: "respond-quote-request",
  },
  function (input: RespondQuoteRequestDTO) {
    const quoteRequest = respondQuoteRequestStep(input)

    return new WorkflowResponse(quoteRequest)
  }
)
