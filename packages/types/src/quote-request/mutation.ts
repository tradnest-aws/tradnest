import { QuoteRequestStatus } from "./common"

export interface CreateQuoteRequestDTO {
  customer_id: string
  seller_id: string
  product_id: string
  product_title?: string | null
  offer_id?: string | null
  variant_id?: string | null
  quantity: number
  message?: string | null
  target_delivery?: string | null
  company_name?: string | null
}

export interface RespondQuoteRequestDTO {
  id: string
  status: Extract<QuoteRequestStatus, "quoted" | "declined">
  seller_note?: string | null
  quoted_unit_amount?: number | null
}

export interface CancelQuoteRequestDTO {
  id: string
}
