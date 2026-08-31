import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"

type SessionCookieFlags = {
  secure: boolean
  sameSite: boolean | "lax" | "strict" | "none"
}

type RequestWithSessionCookie = MedusaRequest & {
  session?: {
    cookie?: SessionCookieFlags
  }
}

export function shouldUseSecureSessionCookie(
  cookieSecureEnv: string | undefined
): boolean {
  return cookieSecureEnv === "true"
}

export function applyHttpSessionCookieFlags(
  cookie: SessionCookieFlags | undefined,
  cookieSecureEnv: string | undefined
): void {
  if (shouldUseSecureSessionCookie(cookieSecureEnv) || !cookie) {
    return
  }
  cookie.secure = false
  cookie.sameSite = "lax"
}

export function forceHttpSessionCookie(
  req: RequestWithSessionCookie,
  _res: MedusaResponse,
  next: MedusaNextFunction
): void {
  applyHttpSessionCookieFlags(req.session?.cookie, process.env.COOKIE_SECURE)
  next()
}
