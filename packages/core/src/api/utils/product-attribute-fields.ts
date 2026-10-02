export const productAttributeBatchResponseFields = [
  "id",
  "title",
  "status",
  "product_attribute_values.id",
  "product_attribute_values.name",
  "product_attribute_values.rank",
  "product_attribute_values.attribute.id",
  "product_attribute_values.attribute.name",
  "product_attribute_values.attribute.handle",
  "product_attribute_values.attribute.type",
  "product_attribute_values.attribute.is_variant_axis",
  "product_attribute_values.attribute.is_required",
  "product_attribute_values.attribute.rank",
  "product_attribute_values.attribute.values.id",
  "product_attribute_values.attribute.values.name",
  "product_attribute_values.attribute.values.rank",
  "scoped_attributes.id",
  "scoped_attributes.name",
  "scoped_attributes.handle",
  "scoped_attributes.type",
  "scoped_attributes.is_variant_axis",
  "scoped_attributes.product_option_id",
  "scoped_attributes.values.id",
  "scoped_attributes.values.name",
  "scoped_attributes.values.rank",
]

/**
 * Storefront historically requested `*attribute_values`, which is not a
 * product relation (the link alias is `product_attribute_values`). That, and a
 * missing `product_attribute_value_link` table, make query.graph 500 — the
 * listing then renders empty. Strip these paths so catalog pages still return
 * products; attributes hydrate separately when the link exists.
 */
export function isProductAttributeGraphField(field: string): boolean {
  const normalized = field.replace(/^[*+-]+/, "")
  return (
    normalized.startsWith("attribute_values") ||
    normalized.startsWith("product_attribute_values") ||
    normalized.startsWith("scoped_attributes")
  )
}

export function omitProductAttributeGraphFields(fields: string[]): string[] {
  return fields.filter((field) => !isProductAttributeGraphField(field))
}

type ProductGraphQuery = {
  graph: (options: {
    entity: string
    fields: string[]
    filters?: Record<string, unknown>
    pagination?: Record<string, unknown>
  }) => Promise<{
    data: Record<string, unknown>[]
    metadata?: { count?: number; skip?: number; take?: number }
  }>
}

export async function queryProductsOmittingBrokenAttributeLinks(
  query: ProductGraphQuery,
  options: {
    fields: string[]
    filters?: Record<string, unknown>
    pagination?: Record<string, unknown>
  }
) {
  const payload = {
    entity: "product" as const,
    fields: options.fields,
    filters: options.filters,
    pagination: options.pagination,
  }

  try {
    return await query.graph(payload)
  } catch (error: unknown) {
    const fields = omitProductAttributeGraphFields(options.fields)
    if (fields.length === options.fields.length) {
      throw error
    }
    return await query.graph({ ...payload, fields })
  }
}
