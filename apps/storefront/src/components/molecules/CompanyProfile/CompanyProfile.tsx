"use client"

import { HttpTypes } from "@medusajs/types"
import { Card } from "@/components/atoms"
import { Divider, Heading } from "@medusajs/ui"
import { readBuyerAccount } from "@/lib/helpers/buyer-account"

export const CompanyProfile = ({ user }: { user: HttpTypes.StoreCustomer }) => {
  const account = readBuyerAccount(user)

  return (
    <div className="mt-8" data-testid="company-profile">
      <Card className="bg-secondary p-4">
        <Heading level="h2" className="heading-sm uppercase">
          Company
        </Heading>
      </Card>
      <Card className="p-0">
        <div className="p-4" data-testid="company-name">
          <p className="label-md text-secondary">Company name</p>
          <p className="label-lg text-primary">
            {account.company_name || "—"}
          </p>
        </div>
        <Divider />
        <div className="p-4" data-testid="company-job-title">
          <p className="label-md text-secondary">Job title</p>
          <p className="label-lg text-primary">{account.job_title || "—"}</p>
        </div>
        <Divider />
        <div className="p-4" data-testid="company-tax-id">
          <p className="label-md text-secondary">VAT / tax ID</p>
          <p className="label-lg text-primary">{account.tax_id || "—"}</p>
        </div>
      </Card>
    </div>
  )
}
