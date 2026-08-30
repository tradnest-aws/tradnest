import { LoginForm, UserNavigation } from "@/components/molecules"
import { QuoteRequestList } from "@/components/organisms/QuoteRequestList/QuoteRequestList"
import { retrieveCustomer } from "@/lib/data/customer"
import { listQuoteRequests } from "@/lib/data/quotes"

export default async function QuoteRequestsPage() {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  const { quote_requests } = await listQuoteRequests()

  return (
    <main className="container" data-testid="quote-requests-page">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3">
          <h1 className="heading-md uppercase mb-8">Quote requests</h1>
          <QuoteRequestList quoteRequests={quote_requests} />
        </div>
      </div>
    </main>
  )
}
