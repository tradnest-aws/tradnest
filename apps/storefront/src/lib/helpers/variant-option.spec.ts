import { expect, test } from "bun:test"

import { isInternalVariantOption } from "./variant-option"

test("treats the stock placeholder option as internal", () => {
  expect(isInternalVariantOption("__default__")).toBe(true)
  expect(isInternalVariantOption("  __DEFAULT__ ")).toBe(true)
})

test("keeps real variant axes visible", () => {
  expect(isInternalVariantOption("Size")).toBe(false)
  expect(isInternalVariantOption("צבע")).toBe(false)
  expect(isInternalVariantOption("")).toBe(false)
  expect(isInternalVariantOption(null)).toBe(false)
})
