export type BuyerAccountMetadata = {
  tax_id?: string
  job_title?: string
  account_type?: "b2b"
}

export type BuyerAccountFields = {
  company_name: string
  tax_id?: string
  job_title?: string
}

export function buildBuyerMetadata(
  fields: Pick<BuyerAccountFields, "tax_id" | "job_title">,
  existing?: Record<string, unknown> | null
): BuyerAccountMetadata {
  return {
    ...existing,
    account_type: "b2b",
    ...(fields.tax_id ? { tax_id: fields.tax_id } : {}),
    ...(fields.job_title ? { job_title: fields.job_title } : {}),
  }
}

export function readBuyerAccount(
  customer: {
    company_name?: string | null
    metadata?: Record<string, unknown> | null
  } | null
): BuyerAccountFields {
  const metadata = (customer?.metadata ?? {}) as BuyerAccountMetadata
  return {
    company_name: customer?.company_name ?? "",
    tax_id: metadata.tax_id,
    job_title: metadata.job_title,
  }
}
