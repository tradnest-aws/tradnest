"use client"

import { QuoteRequestDTO } from "@mercurjs/types"
import { Card } from "@/components/atoms"
import { Divider } from "@medusajs/ui"

const statusLabel: Record<QuoteRequestDTO["status"], string> = {
  pending: "Awaiting supplier",
  quoted: "Quoted",
  accepted: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
}

export const QuoteRequestList = ({
  quoteRequests,
}: {
  quoteRequests: QuoteRequestDTO[]
}) => {
  if (!quoteRequests.length) {
    return (
      <Card className="p-6" data-testid="quote-requests-empty">
        <p className="heading-sm mb-2">No quote requests yet</p>
        <p className="label-md text-secondary">
          Open a catalog item and send a quote request when you need volume
          pricing or a custom lead time.
        </p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3" data-testid="quote-request-list">
      {quoteRequests.map((quote) => (
        <Card key={quote.id} className="p-4" data-testid={`quote-request-${quote.id}`}>
          <div className="flex justify-between gap-4 items-start">
            <div>
              <p className="heading-sm">
                {quote.product_title || quote.product_id}
              </p>
              <p className="label-md text-secondary mt-1">
                Qty {quote.quantity}
                {quote.company_name ? ` · ${quote.company_name}` : ""}
              </p>
            </div>
            <span className="label-sm uppercase border px-2 py-1 rounded-sm">
              {statusLabel[quote.status]}
            </span>
          </div>
          {quote.message && (
            <>
              <Divider className="my-3" />
              <p className="label-md">{quote.message}</p>
            </>
          )}
          {quote.status === "quoted" && (
            <>
              <Divider className="my-3" />
              <p className="label-md">
                Quoted unit amount: {quote.quoted_unit_amount}
              </p>
              {quote.seller_note && (
                <p className="label-md text-secondary mt-1">{quote.seller_note}</p>
              )}
            </>
          )}
        </Card>
      ))}
    </div>
  )
}
