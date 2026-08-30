import { UserNavigation } from "@/components/molecules"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { retrieveCustomer } from "@/lib/data/customer"
import { readBuyerAccount } from "@/lib/helpers/buyer-account"
import { redirect } from "next/navigation"

export default async function UserPage() {
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
          <h1 className="heading-xl uppercase">Welcome {user.first_name}</h1>
          <p className="label-md mt-2">
            {account.company_name
              ? `Buyer account for ${account.company_name}.`
              : "Your buyer account is ready. Add company details in Settings."}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <LocalizedClientLink
              href="/categories"
              className="border rounded-sm p-5"
              data-testid="dashboard-catalog-link"
            >
              <p className="heading-sm uppercase mb-2">Browse catalog</p>
              <p className="label-md text-secondary">
                Compare supplier offers on master products.
              </p>
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/user/quotes"
              className="border rounded-sm p-5"
              data-testid="dashboard-quotes-link"
            >
              <p className="heading-sm uppercase mb-2">Quote requests</p>
              <p className="label-md text-secondary">
                Track RFQs sent to suppliers.
              </p>
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </main>
  )
}
