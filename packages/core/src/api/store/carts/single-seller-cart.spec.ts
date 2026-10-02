import { expect, test } from "bun:test"

import { cartHasAnotherSeller } from "./single-seller-cart"

test("allows an empty cart and the same supplier", () => {
  expect(cartHasAnotherSeller([], "seller_a")).toBe(false)
  expect(cartHasAnotherSeller(["seller_a", "seller_a"], "seller_a")).toBe(false)
})

test("rejects a different supplier and ignores blank ids", () => {
  expect(cartHasAnotherSeller(["seller_a"], "seller_b")).toBe(true)
  expect(cartHasAnotherSeller([null, ""], "seller_b")).toBe(false)
  expect(cartHasAnotherSeller(["seller_a"], "")).toBe(false)
})
