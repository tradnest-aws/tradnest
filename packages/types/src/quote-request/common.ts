import { DeleteResponse, PaginatedResponse } from "@medusajs/types"

export type QuoteRequestStatus =
  | "pending"
  | "quoted"
  | "accepted"
  | "declined"
  | "cancelled"

export interface QuoteRequestDTO {
  id: string
  display_id: number
  quantity: number
  message: string | null
  target_delivery: string | null
  company_name: string | null
  product_id: string
  product_title: string | null
  offer_id: string | null
  variant_id: string | null
  quoted_unit_amount: number | null
  seller_note: string | null
  status: QuoteRequestStatus
  created_at: Date | string
  updated_at: Date | string | null
  deleted_at?: Date | string | null
}

export interface StoreQuoteRequestResponse {
  quote_request: QuoteRequestDTO
}

export type StoreQuoteRequestListResponse = PaginatedResponse<{
  quote_requests: QuoteRequestDTO[]
}>

export type StoreQuoteRequestDeleteResponse = DeleteResponse<"quote_request">

export interface VendorQuoteRequestResponse {
  quote_request: QuoteRequestDTO
}

export type VendorQuoteRequestListResponse = PaginatedResponse<{
  quote_requests: QuoteRequestDTO[]
}>
