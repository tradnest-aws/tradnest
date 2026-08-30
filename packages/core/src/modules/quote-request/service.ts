import { MedusaService } from "@medusajs/framework/utils"

import { QuoteRequest } from "./models"

class QuoteRequestModuleService extends MedusaService({
  QuoteRequest,
}) {}

export default QuoteRequestModuleService
