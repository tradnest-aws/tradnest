export const vendorQuoteRequestFields = [
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
  "created_at",
  "updated_at",
  "customer.id",
  "customer.first_name",
  "customer.last_name",
  "customer.email",
  "customer.company_name",
]

export const vendorQuoteRequestQueryConfig = {
  list: {
    defaults: vendorQuoteRequestFields,
    isList: true,
  },
  retrieve: {
    defaults: vendorQuoteRequestFields,
    isList: false,
  },
}
