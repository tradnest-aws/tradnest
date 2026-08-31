import { LoginForm, ProfileDetails } from "@/components/molecules"
import { UserNavigation } from "@/components/molecules"
import { CompanyProfile } from "@/components/molecules/CompanyProfile/CompanyProfile"
import { ProfilePassword } from "@/components/molecules/ProfileDetails/ProfilePassword"
import { retrieveCustomer } from "@/lib/data/customer"
import { headers } from "next/headers"
import { DEFAULT_STOREFRONT_LOCALE, getCopy } from "@/lib/i18n/copy"

export default async function ReviewsPage() {
  const user = await retrieveCustomer()
  const t = getCopy(
    (await headers()).get("x-locale") || DEFAULT_STOREFRONT_LOCALE
  )

  if (!user) return <LoginForm />

  return (
    <main className="container" data-testid="profile-settings-page">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3" data-testid="profile-settings-container">
          <h1 className="heading-md uppercase mb-8">{t.settings}</h1>
          <ProfileDetails user={user} />
          <CompanyProfile user={user} />
          <ProfilePassword user={user} />
        </div>
      </div>
    </main>
  )
}
