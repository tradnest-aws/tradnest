const INTERNAL_VARIANT_OPTION = "__default__"

export function isInternalVariantOption(title?: string | null): boolean {
  return (title ?? "").trim().toLowerCase() === INTERNAL_VARIANT_OPTION
}
