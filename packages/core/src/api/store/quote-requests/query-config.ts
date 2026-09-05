export const storeQuoteRequestFields = [
  "id",
  "display_id",
  "quantity",
  "message",
  "target_delivery",
  "company_name",
  "product_id",
  "product_title",
  "offer_id",
  "variant_id",
  "quoted_unit_amount",
  "seller_note",
  "status",
  "seller.id",
  "seller.name",
  "seller.handle",
  "created_at",
  "updated_at",
]

export const storeQuoteRequestQueryConfig = {
  list: {
    defaults: storeQuoteRequestFields,
    isList: true,
  },
  retrieve: {
    defaults: storeQuoteRequestFields,
    isList: false,
  },
}
