import { describe, expect, mock, test } from "bun:test"

import { ClientError, createClient, parseResponseBody } from "./index"

describe("parseResponseBody", () => {
  test("treats Medusa 201 Created text as an empty success body", () => {
    const response = new Response("Created", {
      status: 201,
      headers: { "content-type": "text/plain; charset=utf-8" },
    })

    expect(parseResponseBody(response, "Created")).toBeUndefined()
  })

  test("parses JSON success bodies", () => {
    const response = new Response('{"token":"abc"}', {
      status: 200,
      headers: { "content-type": "application/json" },
    })

    expect(parseResponseBody(response, '{"token":"abc"}')).toEqual({
      token: "abc",
    })
  })
})

describe("createClient", () => {
  test("does not throw when reset-password returns 201 Created", async () => {
    const fetchMock = mock(() =>
      Promise.resolve(
        new Response("Created", {
          status: 201,
          headers: { "content-type": "text/plain; charset=utf-8" },
        }),
      ),
    )
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchMock as unknown as typeof fetch

    try {
      const client = createClient({ baseUrl: "http://localhost:9000" })
      await expect(
        client.auth.$actorType.$authProvider.resetPassword.mutate({
          $actorType: "member",
          $authProvider: "emailpass",
          identifier: "pack@tradnest.il",
        }),
      ).resolves.toBeUndefined()
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  test("still surfaces JSON error messages", async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response('{"message":"Invalid email"}', {
          status: 400,
          headers: { "content-type": "application/json" },
        }),
      ),
    ) as unknown as typeof fetch

    try {
      const client = createClient({ baseUrl: "http://localhost:9000" })
      await expect(
        client.auth.$actorType.$authProvider.resetPassword.mutate({
          $actorType: "member",
          $authProvider: "emailpass",
          identifier: "bad",
        }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: "Invalid email",
        }) as ClientError,
      )
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})
