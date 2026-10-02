import { model } from "@medusajs/framework/utils"

const QuoteRequest = model.define("quote_request", {
  id: model.id({ prefix: "qtreq" }).primaryKey(),
  display_id: model.autoincrement(),
  quantity: model.number(),
  message: model.text().nullable(),
  target_delivery: model.text().nullable(),
  company_name: model.text().nullable(),
  product_id: model.text(),
  product_title: model.text().nullable(),
  offer_id: model.text().nullable(),
  variant_id: model.text().nullable(),
  quoted_unit_amount: model.number().nullable(),
  seller_note: model.text().nullable(),
  status: model
    .enum(["pending", "quoted", "accepted", "declined", "cancelled"])
    .default("pending"),
})

export default QuoteRequest
