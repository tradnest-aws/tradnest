import { expect, test } from "bun:test"

import {
  decodeSellerHandle,
  sellerMatchesHandle,
} from "./seller-handle"

const ENCODED = "%D7%9E%D7%97%D7%A1%D7%A0%D7%99-%D7%91%D7%A8%D7%A7"

test("decodes a percent-encoded Hebrew seller handle", () => {
  expect(decodeSellerHandle(ENCODED)).toBe("מחסני-ברק")
})

test("leaves an already decoded handle unchanged", () => {
  expect(decodeSellerHandle("מחסני-ברק")).toBe("מחסני-ברק")
  expect(decodeSellerHandle("floor-cleaner")).toBe("floor-cleaner")
})

test("decodes a handle that was encoded twice", () => {
  expect(decodeSellerHandle(encodeURIComponent(ENCODED))).toBe("מחסני-ברק")
})

test("matches a seller by handle or by name with spaces", () => {
  const seller = { handle: "מחסני-ברק", name: "מחסני ברק" }
  expect(sellerMatchesHandle(seller, ENCODED)).toBe(true)
  expect(sellerMatchesHandle(seller, "מחסני ברק")).toBe(true)
  expect(sellerMatchesHandle(seller, "someone-else")).toBe(false)
})
