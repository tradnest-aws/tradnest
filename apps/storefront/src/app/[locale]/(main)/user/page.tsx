import { UserNavigation } from "@/components/molecules"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { retrieveCustomer } from "@/lib/data/customer"
import { readBuyerAccount } from "@/lib/helpers/buyer-account"
import { redirect } from "next/navigation"
import { getCopy } from "@/lib/i18n/copy"

export default async function UserPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = getCopy(locale)
  const user = await retrieveCustomer()

  if (!user) {
    redirect("/login")
  }

  const account = readBuyerAccount(user)

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3" data-testid="buyer-dashboard">
          <h1 className="heading-xl uppercase">{t.welcome(user.first_name || "")}</h1>
          <p className="label-md mt-2">
            {account.company_name
              ? t.buyerAccountFor(account.company_name)
              : t.buyerAccountReady}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <LocalizedClientLink
              href="/categories"
              className="border rounded-sm p-5"
              data-testid="dashboard-catalog-link"
            >
              <p className="heading-sm uppercase mb-2">{t.browseCatalog}</p>
              <p className="label-md text-secondary">
                {t.browseCatalogHint}
              </p>
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/user/quotes"
              className="border rounded-sm p-5"
              data-testid="dashboard-quotes-link"
            >
              <p className="heading-sm uppercase mb-2">{t.quoteRequests}</p>
              <p className="label-md text-secondary">
                {t.quoteRequestsHint}
              </p>
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </main>
  )
}
