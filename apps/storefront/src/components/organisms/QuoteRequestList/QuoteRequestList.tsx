"use client"

import { QuoteRequestDTO } from "@mercurjs/types"
import { Card } from "@/components/atoms"
import { Divider } from "@medusajs/ui"
import { useCopy } from "@/lib/i18n/useCopy"

export const QuoteRequestList = ({
  quoteRequests,
}: {
  quoteRequests: QuoteRequestDTO[]
}) => {
  const t = useCopy()
  const statusLabel: Record<QuoteRequestDTO["status"], string> = {
    pending: t.quotePending,
    quoted: t.quoteQuoted,
    accepted: t.quoteAccepted,
    declined: t.quoteDeclined,
    cancelled: t.quoteCancelled,
  }
  if (!quoteRequests.length) {
    return (
      <Card className="p-6" data-testid="quote-requests-empty">
        <p className="heading-sm mb-2">{t.noQuotes}</p>
        <p className="label-md text-secondary">{t.noQuotesHint}</p>
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
                {t.qty} {quote.quantity}
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
                {t.quotedUnit} {quote.quoted_unit_amount}
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
