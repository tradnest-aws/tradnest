import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { applyHttpSessionCookieFlags, signedConnectSidCookie } from "../../utils/http-session-cookie"

type SessionCookieFlags = {
  secure: boolean
  sameSite: boolean | "lax" | "strict" | "none"
}

type AuthSession = {
  auth_context?: unknown
  cookie?: SessionCookieFlags
  save: (cb: (err?: Error) => void) => void
  destroy: (cb: (err?: Error) => void) => void
}

function sessionOf(req: AuthenticatedMedusaRequest): AuthSession {
  return req.session as AuthSession
}

type RequestWithSessionId = AuthenticatedMedusaRequest & {
  sessionID?: string
}

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const session = sessionOf(req)
  applyHttpSessionCookieFlags(session.cookie, process.env.COOKIE_SECURE)
  session.auth_context = req.auth_context

  await new Promise<void>((resolve, reject) => {
    session.save((err) => (err ? reject(err) : resolve()))
  })

  const sessionId = (req as RequestWithSessionId).sessionID
  const secret = req.scope.resolve(ContainerRegistrationKeys.CONFIG_MODULE)
    .projectConfig.http?.cookieSecret
  if (sessionId && secret) {
    res.setHeader(
      "Set-Cookie",
      signedConnectSidCookie(
        sessionId,
        secret,
        process.env.COOKIE_SECURE === "true"
      )
    )
  }

  res.status(200).json({ user: req.auth_context })
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { sessionOptions, cookieOptions } = req.scope.resolve(
    ContainerRegistrationKeys.CONFIG_MODULE
  ).projectConfig

  const cookieName = sessionOptions?.name ?? "connect.sid"

  try {
    await new Promise<void>((resolve, reject) => {
      sessionOf(req).destroy((err) => (err ? reject(err) : resolve()))
    })
  } finally {
    res.clearCookie(cookieName, cookieOptions)
  }

  res.json({ success: true })
}
