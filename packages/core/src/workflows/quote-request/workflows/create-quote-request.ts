import {
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { CreateQuoteRequestDTO } from "@mercurjs/types"

import { createQuoteRequestStep } from "../steps"

export const createQuoteRequestWorkflow = createWorkflow(
  {
    name: "create-quote-request",
  },
  function (input: CreateQuoteRequestDTO) {
    const quoteRequest = createQuoteRequestStep(input)

    return new WorkflowResponse(quoteRequest)
  }
)
