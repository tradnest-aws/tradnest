import { expect, test } from "bun:test"

import {
  cartHasAnotherSeller,
  isSingleSellerCartError,
} from "./single-seller-cart"

test("allows the first supplier and more products from that supplier", () => {
  expect(cartHasAnotherSeller([], "seller_a")).toBe(false)
  expect(
    cartHasAnotherSeller(
      [{ metadata: { seller_id: "seller_a" } }],
      "seller_a"
    )
  ).toBe(false)
})

test("blocks a second supplier without treating an unknown cart as mixed", () => {
  expect(
    cartHasAnotherSeller(
      [{ offer: { seller: { id: "seller_a" } } }],
      "seller_b"
    )
  ).toBe(true)
  expect(cartHasAnotherSeller([{ metadata: { offer_id: "off_1" } }], "seller_b")).toBe(
    false
  )
})

test("recognizes the single-supplier API error", () => {
  expect(isSingleSellerCartError(new Error("SINGLE_SELLER_CART"))).toBe(true)
  expect(isSingleSellerCartError(new Error("Not enough stock"))).toBe(false)
})
