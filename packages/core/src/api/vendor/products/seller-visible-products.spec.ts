import { expect, test } from "bun:test"

import { sellerVisibleProductIds } from "./seller-visible-products"

test("unions products the store created with products it was assigned", () => {
  expect(sellerVisibleProductIds(["prod_a", "prod_a"], ["prod_b"])).toEqual([
    "prod_a",
    "prod_b",
  ])
})

test("does not match every product when the store has none", () => {
  expect(sellerVisibleProductIds([], [])).toEqual(["__none__"])
  expect(sellerVisibleProductIds([""], [])).toEqual(["__none__"])
})
