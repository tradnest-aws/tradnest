import { LoginForm } from "@/components/molecules/LoginForm/LoginForm"
import { UserNavigation } from "@/components/molecules/UserNavigation/UserNavigation"
import { UserMessagesSection } from "@/components/sections/UserMessagesSection/UserMessagesSection"
import { retrieveCustomer } from "@/lib/data/customer"
import { DEFAULT_STOREFRONT_LOCALE, getCopy } from "@/lib/i18n/copy"
import { headers } from "next/headers"

export default async function MessagesPage() {
  const user = await retrieveCustomer()
  const t = getCopy(
    (await headers()).get("x-locale") || DEFAULT_STOREFRONT_LOCALE
  )

  if (!user) return <LoginForm />

  return (
    <main className="container" data-testid="user-messages-page">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3 space-y-8">
          <h1 className="heading-md uppercase">{t.messages}</h1>
          <UserMessagesSection />
        </div>
      </div>
    </main>
  )
}
