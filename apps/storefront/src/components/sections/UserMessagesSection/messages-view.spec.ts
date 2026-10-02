import { expect, test } from "bun:test"

import { resolveMessagesView } from "./messages-view"

test("shows an empty inbox when chat is not configured", () => {
  expect(
    resolveMessagesView({ appId: "", sessionAlive: false, timedOut: false })
  ).toBe("empty")
})

test("waits for a live chat session, then opens the inbox", () => {
  expect(
    resolveMessagesView({
      appId: "app",
      sessionAlive: false,
      timedOut: false,
    })
  ).toBe("loading")
  expect(
    resolveMessagesView({ appId: "app", sessionAlive: true, timedOut: false })
  ).toBe("inbox")
})

test("stops waiting when the chat session never starts", () => {
  expect(
    resolveMessagesView({ appId: "app", sessionAlive: false, timedOut: true })
  ).toBe("empty")
})
