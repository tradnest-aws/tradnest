import { expect, test } from "bun:test"
import { toHreflang } from "./hreflang"

test("maps Israel storefront locale il to he-IL", () => {
  expect(toHreflang("il")).toBe("he-IL")
})
