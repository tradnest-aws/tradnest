import { applyHttpSessionCookieFlags, signedConnectSidCookie } from "../http-session-cookie"

describe("applyHttpSessionCookieFlags", () => {
  it("clears Secure so HTTP /app can persist connect.sid", () => {
    const cookie = { secure: true, sameSite: "lax" as const }
    applyHttpSessionCookieFlags(cookie, undefined)
    expect(cookie.secure).toBe(false)
    expect(cookie.sameSite).toBe("lax")
  })

  it("keeps Secure when COOKIE_SECURE=true", () => {
    const cookie = { secure: true, sameSite: "lax" as const }
    applyHttpSessionCookieFlags(cookie, "true")
    expect(cookie.secure).toBe(true)
  })
})

describe("signedConnectSidCookie", () => {
  it("emits a non-Secure connect.sid cookie on HTTP", () => {
    const header = signedConnectSidCookie("sid123", "supersecret", false)
    expect(header.startsWith("connect.sid=")).toBe(true)
    expect(header).toContain("HttpOnly")
    expect(header).toContain("SameSite=Lax")
    expect(header).not.toContain("Secure")
  })
})

describe("applyHttpSessionCookieFlags", () => {
  it("clears Secure so HTTP /app can persist connect.sid", () => {
    const cookie = { secure: true, sameSite: "lax" as const }
    applyHttpSessionCookieFlags(cookie, undefined)
    expect(cookie.secure).toBe(false)
    expect(cookie.sameSite).toBe("lax")
  })

  it("keeps Secure when COOKIE_SECURE=true", () => {
    const cookie = { secure: true, sameSite: "lax" as const }
    applyHttpSessionCookieFlags(cookie, "true")
    expect(cookie.secure).toBe(true)
  })
})
