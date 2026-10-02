import { Module } from "@medusajs/framework/utils"
import { MercurModules } from "@mercurjs/types"

import QuoteRequestModuleService from "./service"

export default Module(MercurModules.QUOTE_REQUEST, {
  service: QuoteRequestModuleService,
})
